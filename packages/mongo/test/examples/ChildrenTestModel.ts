import { Name, Parent } from '../../src/Model';
import TestModel, { ITestModel, TestModel as TestModelBase } from './TestModel';

export interface IChildrenTestModel extends ITestModel {
  _id?: string | any;
  children?: string;
}

@Parent(TestModel)
@Name('ChildrenTestModel')
export class ChildrenTestModel<T extends IChildrenTestModel> extends TestModelBase<T> {
  public schema: any = {
    type: 'object',
    properties: {
      children: {
        type: 'string'
      },
    },
    additionalProperties: false,
  };

}

export default new ChildrenTestModel();
