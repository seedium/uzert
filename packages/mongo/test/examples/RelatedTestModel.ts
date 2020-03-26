import Model, { Name, Collection } from '../../src/Model';
import { ITestModel } from './TestModel';

export interface IRelatedTestModel {
  _id?: string | any;
  related?: number;
  link?: ITestModel;
}

@Name('RelatedTestModel')
@Collection('relatedtests')
export class RelatedTestModel<T extends IRelatedTestModel> extends Model<T> {
  public schema = {
    type: 'object',
    properties: {
      _id: {
        type: 'object',
      },
      related: {
        type: 'number'
      },
      link: {
        type: 'object',
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
    link: {
      ref: 'TestModel',
    },
  };
}

export default new RelatedTestModel();
