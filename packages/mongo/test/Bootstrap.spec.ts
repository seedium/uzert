import * as path from 'path';
import Config from '@uzert/config';
import Validation from '@uzert/validation';
import Logger from '@uzert/logger';
import Bootstrap from '../providers/model-bootstrap.provider';
import MongoClient from '../services/Client';
// models
import TestModel from './examples/TestModel';
import NestedTestModel from './examples/Nested/NestedTestModel';
import RelatedTestModel from './examples/RelatedTestModel';
import ChildrenTestModel from './examples/ChildrenTestModel';

describe('Bootstrap', () => {
  before(async () => {
    await Config.boot({
      basePath: path.resolve(process.cwd(), 'test', 'config'),
      pattern: '*.ts',
      useAbsolute: false,
    });
    await Logger.boot();
    await MongoClient.boot();
    await Validation.boot();
  });

  after(async () => {
    await Validation.unBoot();
    await MongoClient.unBoot();
    await Logger.unBoot();
    await Config.unBoot();
    TestModel.unBoot();
    NestedTestModel.unBoot();
    RelatedTestModel.unBoot();
    ChildrenTestModel.unBoot();
  });

  it('models should not be booted', async () => {
    try {
      const collectionTest = TestModel.collection;
      const collectionNestedTest = NestedTestModel.collection;
      const collectionRelatedTest = RelatedTestModel.collection;
      const collectionChildrenTest = ChildrenTestModel.collection;
    } catch (e) {
      return;
    }

    throw new Error('models are booted');
  });

  // TODO if you have enough time, please uncomment and fix issue
  /*it('should bootstrap example models', async () => {
    await Bootstrap.boot({
      basePath: path.resolve(process.cwd(), 'test', 'examples'),
      pattern: '**!/!*.ts',
      useAbsolute: false,
    });
    expect(TestModel.collection).is.not.null;
    expect(NestedTestModel.collection).is.not.null;
    expect(RelatedTestModel.collection).is.not.null;
    expect(ChildrenTestModel.collection).is.not.null;
  });*/
});
