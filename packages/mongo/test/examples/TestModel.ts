import Model, { Name, Collection } from '../../services/Model';
import { IRelatedTestModel } from './RelatedTestModel';

export interface ITestModel {
  _id?: string | any;
  testField?: string;
  links?: IRelatedTestModel[];
}

@Name('TestModel')
@Collection('tests')
export class TestModel<T extends ITestModel> extends Model<T> {
  public schema = {
    type: 'object',
    properties: {
      _id: {
        type: 'object',
      },
      testField: {
        type: 'string',
      },
      extra: {
        type: 'object',
      },
      localLinks: {
        type: 'array',
        items: {
          type: ['object', 'string'],
          objectId: true,
        },
        default: [],
      },
      numberField: {
        type: 'number',
      },
      created: {
        type: 'number',
      },
      updated: {
        type: 'number',
      },
    },
    additionalProperties: false,
  };

  public expandable = {
    links: [
      {
        ref: 'RelatedTestModel',
        foreignField: 'link',
        localField: '_id',
      },
    ],
    localLinks: [
      {
        ref: 'RelatedTestModel',
        local: true,
      },
    ],
    extra: {
      ref: 'RelatedTestModel',
    },
  };
}

export default new TestModel();
