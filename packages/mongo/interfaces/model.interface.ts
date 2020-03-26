import { ObjectId } from 'bson';
import { IndexSpecification, ClientSession, Collection } from 'mongodb';
import { IProvider } from '@uzert/core';
import { IErrorHandler } from './boot.interface';

export interface IList<T> {
  /**
   * An array containing the actual response elements, paginated by any request parameters.
   */
  data: T[];

  /*
   *
   * Url for next pagination with page info base 64 encoded
   *
   * */
  nextUrl: string | null;

  /*
   *
   * Url for previous pagination with page info base 64 encoded
   *
   * */
  prevUrl: string | null;

  /**
   * The total number of items available. This value is not included by default,
   * but you can request it by specifying ?include[]=total_count
   */
  totalCount?: number;

  /**
   * The URL for accessing this list.
   */
  url?: string;
}

export interface IDataOptions {
  expand?: string[];
  include?: string[];
}

export interface IListOptions extends IDataOptions {
  /**
   * A limit on the number of objects to be returned. Limit can range between 1 and 100 items.
   */
  limit?: number;

  /*
   *
   * Pass array of fields on which should sort
   *
   * */
  sort?: string[];

  /*
   *
   * Page info metadata for cursor pagination working
   *
   * */
  pageInfo?: string;

  /*
   *
   * Can be passed any data for filtering
   *
   * */
  [field: string]: any;
}

export type IDateFilter =
  | number
  | {
      /**
       * Return values where the created field is after this timestamp.
       */
      gt?: number;

      /**
       * Return values where the created field is after or equal to this timestamp.
       */
      gte?: number;

      /**
       * Return values where the created field is before this timestamp.
       */
      lt?: number;

      /**
       * Return values where the created field is before or equal to this timestamp.
       */
      lte?: number;

      [operator: string]: number | undefined;
    };

export interface IListOptionsCreated extends IListOptions {
  created?: IDateFilter;
}

export interface IPrepareListOptions<T> extends Omit<IListOptionsCreated, 'pageInfo'> {
  pageInfo?: IPageInfo | null;
  data: T[];
}

export interface IResourceObject {
  _id?: string | any;
  created?: number;
  updated?: number;
}
// This line can be removed after minimum required TypeScript Version is above 3.5
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

export type ExtractIdType<TSchema> = TSchema extends { _id: infer U } // user has defined a type for _id
  ? {} extends U
    ? Exclude<U, {}>
    : unknown extends U
    ? ObjectId
    : U
  : ObjectId; // user has not defined _id on schema

export type WithId<TSchema> = Omit<TSchema, '_id'> & { _id: ExtractIdType<TSchema> };

export interface IRefCollection {
  ref: string;
  localField?: string;
  foreignField?: string;
  as?: string;
  local?: boolean;
}

export interface IRefsCollection {
  [field: string]: IRefCollection | IRefCollection[];
}

export interface ISchemasCollection {
  [key: string]: any;
}

export interface ILookupOptions {
  [firstLevel: string]:
    | {
        [secondLevel: string]:
          | {
              [thirdLevel: string]: object | [];
            }
          | [];
      }
    | [];
}

export interface IModel<T = any> extends IProvider {
  name: string | null;
  parent?: IModel;
  $collection: string | null;
  schema: any;
  schemas?: ISchemasCollection;
  indexes: IndexSpecification[];
  collection: Collection<T>;
  expandable: IRefsCollection;
  validate<Payload = OptionalId<T>>(payload: Payload): Payload;
  create(data: unknown, options?: IOptions): Promise<WithId<T>>;
  list(options?: IListOptions, mongoOptions?: IOptions): Promise<IList<T>>;
  update(_id: string | any, data: unknown, options?: IOptions): Promise<T>;
  retrieve(_id: string | any, dataOptions?: IDataOptions, options?: IOptions): Promise<T>;
  getLookup(options: ILookupOptions): any[];
}

export type OptionalId<TSchema> = Omit<TSchema, '_id'> & { _id?: any };

export interface MongoDateFilter {
  $gt?: number;
  $gte?: number;
  $lt?: number;
  $lte?: number;
  $eq?: number;
  [operator: string]: number | undefined;
}

export interface IOptions {
  session?: ClientSession;
  [key: string]: any;
}

export interface IModelOptions {
  errorHandler?: IErrorHandler;
}

export type IPaginateDirection = 'prev' | 'next';

export interface IPageInfo {
  direction: IPaginateDirection;
  _id?: string | any;
  [field: string]: any;
}
