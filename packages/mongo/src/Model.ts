import { Db, ObjectId } from 'mongodb';
import * as qs from 'qs';
// core
import Config from '@uzert/config';
import Logger from '@uzert/logger';
import Validation, { ErrorObject } from '@uzert/validation';
import { isPlainObject, merge } from '@uzert/helpers';
import Bootstrap from './Bootstrap';
// types
import {
  IRefsCollection,
  IndexSpecification,
  ICollection,
  IModel,
  OptionalId,
  ISchemasCollection,
  ILookupOptions,
  IRefCollection,
  MongoDateFilter,
  IList,
  IDataOptions,
  IListOptionsCreated,
  IResourceObject,
  IDateFilter,
  IModelOptions,
  IOptions,
  IPageInfo,
  IPaginateDirection,
  IPrepareListOptions,
} from './index';
// errors
import ClientNotBootedError from './errors/ClientNotBootedError';

export default abstract class Model<T extends IResourceObject> implements IModel<T> {
  // collection name in database
  public $collection: string | null = null;

  // public name for schema reference
  public name: string | null = null;

  // set model dependencies for schema references
  public parent?: IModel;

  // schema validator for saving documents in collection
  public schema: any;

  // schemas validator for using in other schemas
  public schemas: ISchemasCollection = {};

  // specify indexes for collection
  public indexes: IndexSpecification[] = [];

  // refs to other collections
  public expandable: IRefsCollection = {};

  // helper for casting date filter from client to mongo
  public mapDateFilter: {
    [operator: string]: string;
  } = {
    gt: '$gt',
    gte: '$gte',
    lt: '$lt',
    lte: '$lte',
  };

  // access to collection
  protected collectionRef: ICollection<T> | undefined;

  get collection(): ICollection<T> {
    if (!this.collectionRef) {
      throw new ClientNotBootedError();
    }

    return this.collectionRef;
  }

  public async boot(db?: Db, { errorHandler }: IModelOptions = {}): Promise<IModel<T>> {
    if (!db) {
      throw Error(`Connection not found. Seems "MongoProvider" not booted`);
    }

    if (!this.name) {
      throw new Error(`Please inject unique name for model "${this.constructor.name}"`);
    } else if (Bootstrap.getFromRepository(this.name)) {
      throw new Error(`Name "${this.name}" in model ${this.constructor.name} already exists`);
    }

    if (!this.$collection) {
      throw new Error(`Please inject collection name for model "${this.constructor.name}"`);
    }

    try {
      await db.createCollection(this.$collection);
    } catch (e) {
      Logger.pino.trace(e.message);
    }

    this.collectionRef = db.collection<T>(this.$collection);

    // create indexes if exists
    if (this.indexes.length) {
      try {
        await this.collection.createIndexes(this.indexes);
      } catch (e) {
        Logger.pino.trace(`missing creating indexes ${JSON.stringify(this.indexes)}`);
      }
    }

    let schema = this.schema;

    if (this.parent) {
      schema = {
        $merge: {
          source: Validation.getModelSchemaRef(this.parent.name || 'undefined'),
          with: this.schema,
        },
      };

      this.expandable = {
        ...this.parent.expandable,
        ...this.expandable,
      };
    }

    Validation.addSchema('models', this.name, schema);

    // add shared schemas
    for (const name in this.schemas) {
      if (this.schemas.hasOwnProperty(name)) {
        Validation.addSchema('models', name, this.schemas[name]);
      }
    }

    Bootstrap.addToRepository(this.name, this);

    // set custom error handler if provided
    if (errorHandler) {
      this.errorHandler = errorHandler;
    }

    return this;
  }

  public unBoot() {
    this.collectionRef = undefined;
  }

  public validate<Payload = OptionalId<T>>(payload: Payload): Payload {
    const compiler = Validation.getSchemaCompiler('models', this.name || 'undefined');
    // validate payload based on schema definition
    let validated: boolean | any = true;

    if (compiler) {
      validated = compiler(payload);
    }

    if (!validated) {
      this.errorHandler(compiler.errors);
    }

    return payload;
  }

  public errorHandler(errors?: ErrorObject[] | null): void {
    if (errors) {
      errors.forEach((error) => {
        throw new Error(error.message);
      });
    }
  }

  public async create(data: any, options?: IOptions): Promise<any> {
    data = {
      ...data,
      created: Date.now(),
      updated: Date.now(),
    };

    this.validate(data);

    const {
      ops: [record],
    } = await this.collection.insertOne(data, options);

    return record;
  }

  public async update(_id: string | any, data: any, options?: IOptions): Promise<T> {
    if (typeof _id === 'string') {
      _id = new ObjectId(_id);
    }

    const { _id: deletedId, ...record } = await this.retrieve(_id, undefined, options);

    data = merge(record, {
      ...data,
      updated: Date.now(),
    });

    this.validate(data);

    await this.collection.updateOne(
      {
        _id,
      },
      {
        $set: data,
      },
      options,
    );

    return {
      _id,
      ...data,
    };
  }

  public async delete(_id: string | any, options?: IOptions): Promise<void> {
    if (typeof _id === 'string') {
      _id = new ObjectId(_id);
    }

    await this.collection.deleteOne({ _id }, options);
  }

  public async retrieve(_id: string | any, { expand }: IDataOptions = {}, options?: IOptions): Promise<any> {
    if (typeof _id === 'string') {
      _id = new ObjectId(_id);
    }

    const aggregation: any[] = [
      {
        $match: {
          _id,
        },
      },
    ];

    const expandGrouped = this.groupExpands(expand);
    aggregation.push(...this.getLookup(expandGrouped));

    const [record] = await this.collection.aggregate(aggregation, options).toArray();

    if (!record) {
      return null;
    }

    return record;
  }

  public async find(match: object, { expand }: IDataOptions = {}, options?: IOptions): Promise<any> {
    const aggregation: any[] = [
      {
        $match: match,
      },
    ];

    const expandGrouped = this.groupExpands(expand);
    aggregation.push(...this.getLookup(expandGrouped));

    const [record] = await this.collection.aggregate(aggregation, options).toArray();

    if (!record) {
      return null;
    }

    return record;
  }

  public async list(
    {
      limit,
      pageInfo: pageInfoBase64,
      include = [],
      expand = [],
      created,
      sort = [],
      ...filter
    }: IListOptionsCreated = {},
    options?: IOptions,
  ): Promise<IList<T>> {
    limit = this.applyLimit(limit);
    const pageInfo = this.decodePageInfo(pageInfoBase64);

    const { match: cursorMatch, sort: $sort } = this.getCursor(sort ?? [], pageInfo);

    const $match = {
      ...filter,
      ...cursorMatch,
    };

    if (filter._id && isPlainObject(filter._id)) {
      $match._id = {
        ...$match._id,
        ...filter._id,
      };
    } else if (filter._id) {
      $match._id = filter._id;
    }

    const aggregation: any[] = [
      {
        $match: {
          ...$match,
          ...this.castDateFilter(created),
        },
      },
    ];

    if (Object.keys($sort).length) {
      aggregation.push({
        $sort,
      });
    }

    aggregation.push({
      $limit: limit + 1,
    });

    const expandGrouped = this.groupExpands(expand);
    aggregation.push(...this.getLookup(expandGrouped));

    const toExecute: any[] = [];

    toExecute.push(this.collection.aggregate(aggregation, options).toArray());

    if (include.length) {
      if (include.includes('totalCount')) {
        // TODO fix as any
        toExecute.push(this.collection.countDocuments(filter as any));
      }
    }

    const [data, totalCount] = await Promise.all(toExecute);

    return {
      ...this.prepareListResponse({
        data,
        limit,
        pageInfo,
        sort,
        include,
        created,
        expand,
        ...filter,
      }),
      totalCount,
    };
  }

  public getSortDirection(sort: string): [string, number] {
    const [sign, ...field] = sort;
    const joinedField = field.join('');

    if (sign === '-') {
      return [joinedField, -1];
    } else if (sign === '+') {
      return [joinedField, 1];
    } else {
      return [sign + joinedField, 1];
    }
  }

  public groupExpands(expand: string[] = []): ILookupOptions {
    let result = {};

    expand.forEach((path) => {
      result = this.getNested(result, path);
    });

    return result;
  }

  public getNested(result: ILookupOptions = {}, path: string) {
    const [currentLevel, ...nextLevels] = path.split('.');

    result[currentLevel] = result[currentLevel] || {};

    if (nextLevels.length) {
      result[currentLevel] = this.getNested(result[currentLevel] as {}, nextLevels.join('.'));
    }

    return result;
  }

  /*
		collect pipelines recursively for every nested level
		iterations variable for returning just nested pipelines in the end
	 */
  public getLookup(options: ILookupOptions): any[] {
    const pipeline = [];

    for (const field in options) {
      if (field) {
        if (!this.expandable[field]) {
          break;
        }

        const isArray = Array.isArray(this.expandable[field]);
        let data: IRefCollection;
        let lookupOperator = '$eq';

        if (isArray) {
          [data] = this.expandable[field];

          if (data.local) {
            lookupOperator = '$in';
          }
        } else {
          data = this.expandable[field] as IRefCollection;

          pipeline.push({
            $addFields: {
              [field]: {
                $arrayElemAt: [`$${field}`, 0],
              },
            },
          });
        }

        const model = getModelFromRepository(data.ref);

        const lookupPipeline = [
          {
            $match: {
              $expr: {
                [lookupOperator]: [`$${data.foreignField || '_id'}`, '$$localField'],
              },
            },
          },
          ...model.getLookup(options[field] as {}),
        ];

        /*
         * if is array and we search local array field, need filter documents where
         * local field array to prevent errors in $in operator
         * */
        if (isArray && data.local) {
          lookupPipeline.unshift({
            $match: {
              $expr: {
                $isArray: '$$localField',
              },
            },
          });
        }

        pipeline.unshift({
          $lookup: {
            from: model.$collection,
            as: data.as || field,
            let: {
              localField: `$${data.localField || field || '_id'}`,
            },
            pipeline: lookupPipeline,
          },
        });
      }
    }

    return pipeline;
  }

  public buildPageInfo(direction: IPaginateDirection, data: T[], sort: string[] = []): string | null {
    let document: any;

    if (direction === 'next') {
      document = data[data.length - 1];
    } else {
      document = data[0];
    }

    if (!document) {
      return null;
    }

    const lastValues = sort.reduce<any>(
      (values, item) => {
        const [field] = this.getSortDirection(item);

        values[field] = document[field];

        return values;
      },
      {
        _id: document._id,
      },
    );

    return this.encodePageInfo({
      direction,
      ...lastValues,
    });
  }

  public prepareListResponse<U = T>({ data, limit, pageInfo, sort, ...filter }: IPrepareListOptions<T>): IList<T> {
    const defaultParams = {
      limit,
      sort,
      ...filter,
    };

    const hasMore = data.length > limit;

    if (hasMore) {
      data.pop();
    }

    // TODO need to simplify this condition
    const hasMoreNext = (hasMore && (!pageInfo || pageInfo.direction === 'next')) || pageInfo?.direction === 'prev';
    const hasMorePrevious = pageInfo?.direction === 'next' || (hasMore && pageInfo?.direction === 'prev');

    if (pageInfo?.direction === 'prev') {
      data.reverse();
    }

    return {
      data,
      prevUrl: !hasMorePrevious
        ? null
        : qs.stringify({
            ...defaultParams,
            pageInfo: this.buildPageInfo('prev', data, sort),
          }),
      nextUrl: !hasMoreNext
        ? null
        : qs.stringify({
            ...defaultParams,
            pageInfo: this.buildPageInfo('next', data, sort),
          }),
    };
  }

  public applyLimit(limit = Config.get('database:limit:default', 20)): number {
    const maxLimit = Config.get('database:limit:max', 100);
    const minLimit = Config.get('database:limit:min', 1);

    let resultLimit = +limit;

    if (limit < minLimit) {
      resultLimit = minLimit;
    } else if (limit > maxLimit) {
      resultLimit = maxLimit;
    }

    return resultLimit;
  }

  public applyLastMatchExpr($match: any, pageInfo: IPageInfo, lastExpr: object): object {
    const operator = pageInfo.direction === 'next' ? '$gt' : '$lt';

    if (Object.keys(lastExpr).length) {
      $match.$or.push({
        ...lastExpr,
        _id: {
          [operator]: new ObjectId(pageInfo._id),
        },
      });
    } else {
      $match = {
        _id: {
          [operator]: new ObjectId(pageInfo._id),
        },
      };
    }

    return $match;
  }

  public getMatchExpr(pageInfo: IPageInfo, sortObject: any): object {
    let $match: any = {};
    const sortedFields = Object.keys(sortObject).filter((field) => field !== '_id');

    if (sortedFields.length) {
      $match = {
        ...$match,
        $or: [],
      };
    }

    let lastExpr = {};

    sortedFields.forEach((field) => {
      if (pageInfo[field]) {
        const operator: string = sortObject[field] === 1 ? '$gt' : '$lt';

        $match.$or.push({
          ...lastExpr,
          [field]: {
            [operator]: pageInfo[field],
          },
        });

        lastExpr = {
          ...lastExpr,
          [field]: {
            $eq: pageInfo[field],
          },
        };
      }
    });

    $match = this.applyLastMatchExpr($match, pageInfo, lastExpr);

    return $match;
  }

  public getCursor(
    sort: string[],
    pageInfo?: IPageInfo | null,
  ): {
    match: object;
    sort: object;
  } {
    let $match: any = {};
    const $sort: any = {};

    sort.forEach((item) => {
      const [field, dir] = this.getSortDirection(item);

      $sort[field] = dir;

      if (pageInfo?.direction === 'prev') {
        $sort[field] = -dir;
      }
    });

    if (!pageInfo) {
      return {
        match: $match,
        sort: $sort,
      };
    }

    if (!pageInfo._id || !pageInfo.direction) {
      throw new Error('Cursor is broken. Need "_id" and "direction" parameters in your "pageInfo"');
    }

    $match = this.getMatchExpr(pageInfo, $sort);

    if (pageInfo.direction === 'prev') {
      $sort._id = -1;
    } else {
      $sort._id = 1;
    }

    return {
      match: $match,
      sort: $sort,
    };
  }

  public castDateFilter(
    date?: IDateFilter,
  ): {
    created?: MongoDateFilter;
  } {
    if (!date) {
      return {};
    }

    if (typeof date === 'number') {
      return {
        created: {
          $eq: date,
        },
      };
    }

    return Object.keys(date).reduce(
      (
        dateFilter: {
          created: MongoDateFilter;
        },
        key,
      ) => {
        const mongoKey = this.mapDateFilter[key];

        if (mongoKey) {
          dateFilter.created[mongoKey] = date[key];
        }

        return dateFilter;
      },
      {
        created: {},
      },
    );
  }

  public decodePageInfo(pageInfoBase64?: string): IPageInfo | null {
    if (!pageInfoBase64) {
      return null;
    }

    const buffer = Buffer.from(pageInfoBase64, 'base64');

    const stringified = buffer.toString('ascii');

    return JSON.parse(stringified);
  }

  public encodePageInfo(pageInfo: IPageInfo): string {
    const stringified = JSON.stringify(pageInfo);

    const buffer = Buffer.from(stringified);

    return buffer.toString('base64');
  }
}

// decorators
export function Parent(parent: IModel) {
  return function<T extends new (...args: any[]) => {}>(constructor: T) {
    return class extends constructor {
      public parent = parent;
    };
  };
}

export function Name(name: string) {
  return function<T extends new (...args: any[]) => {}>(constructor: T) {
    return class extends constructor {
      public name = name;
    };
  };
}

export function Collection(collection: string) {
  return function<T extends new (...args: any[]) => {}>(constructor: T) {
    return class extends constructor {
      public $collection = collection;
    };
  };
}

export const getModelFromRepository = (name: string): IModel => {
  const model = Bootstrap.getFromRepository(name);

  if (!model || !model.name) {
    throw new Error(`Ref ${name} not found. Please check your model or fix reference in schema`);
  }

  return model;
};
