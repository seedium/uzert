import Model, { Name, Collection } from '../../../src/Model';

export interface INestedTestModel {
  _id?: string | any;
  testField?: string;
}

@Name('NestedTestModel')
@Collection('nestedtests')
export class NestedTestModel<T extends INestedTestModel> extends Model<T> {
  public schema = {
    type: 'object',
    properties: {
      _id: {
        type: 'object',
      },
      testField: {
        type: 'string'
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
}

export default new NestedTestModel();
