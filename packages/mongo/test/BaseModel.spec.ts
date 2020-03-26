import { expect } from 'chai';
import * as path from 'path';
import * as qs from 'qs';
// providers
import Log from '@uzert/logger';
import Config from '@uzert/config';
import Validation from '@uzert/validation';
import MongoClient from '../services/Client';
import Bootstrap from '../providers/Bootstrap';
// models
import TestModel, { ITestModel } from './examples/TestModel';
import ChildrenTestModel, { IChildrenTestModel } from './examples/ChildrenTestModel';
import RelatedTestModel, { IRelatedTestModel } from './examples/RelatedTestModel';
import NestedTestModel from './examples/Nested/NestedTestModel';
import { paginateForward, sortFieldBy } from './helpers';

const generatedRandomInt = [];

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  while (true) {
    const value = Math.floor(Math.random() * (max - min)) + min;

    if (generatedRandomInt.indexOf(value) === -1) {
      generatedRandomInt.push(value);

      return value;
    }
  }
};

describe('BaseModel', () => {
  let test: ITestModel;
  let relatedTest: IRelatedTestModel;
  let childrenTest: IChildrenTestModel;

  before(async () => {
    await Config.boot({
      basePath: path.resolve(process.cwd(), 'test', 'config'),
      pattern: '*.ts',
      useAbsolute: false,
    });
    await Log.boot();
    await MongoClient.boot();
    await Validation.boot();
    await Bootstrap.boot({
      basePath: path.resolve(process.cwd(), 'test', 'examples'),
      useAbsolute: false,
    });
  });

  after(async () => {
    TestModel.unBoot();
    NestedTestModel.unBoot();
    RelatedTestModel.unBoot();
    ChildrenTestModel.unBoot();
    await Validation.unBoot();
    await MongoClient.unBoot();
    await Log.unBoot();
    await Config.unBoot();
  });

  describe('Options', () => {
    beforeEach(async () => {
      // create test data
      test = await TestModel.create({
        testField: 'test',
        // @ts-ignore
        children: 'children field',
      });
      relatedTest = await RelatedTestModel.create({
        related: 5,
        link: test._id,
      });
      await TestModel.collection.updateOne(
        { _id: test._id },
        {
          $set: {
            extra: relatedTest._id,
          },
        },
      );
      childrenTest = await ChildrenTestModel.create({
        testField: '23423',
        children: 'children field',
      });
    });

    afterEach(async () => {
      await Promise.all([
        TestModel.collection.deleteMany({}),
        RelatedTestModel.collection.deleteMany({}),
        ChildrenTestModel.collection.deleteMany({}),
      ]);
    });

    it('model should be booted', async () => {
      expect(TestModel).property('collection').not.undefined;
      expect(ChildrenTestModel)
        .property('parent')
        .eq(TestModel);
    });

    it('schemas should work', async () => {
      expect(test).property('testField');
      expect(test).not.property('children');

      expect(relatedTest).property('related');
      expect(relatedTest)
        .property('link')
        .eq(test._id);

      expect(childrenTest).property('testField');
      expect(childrenTest).property('children');
    });

    it('should not expand object fields by default', async () => {
      const result = await RelatedTestModel.retrieve(relatedTest._id);
      expect(result)
        .property('link')
        .not.property('_id');
    });

    it('should not expand array fields in list by default', async () => {
      const result = await TestModel.list();
      const [firstElem] = result.data;
      expect(firstElem).not.to.haveOwnProperty('links');
    });

    it('should expand array fields in list by request', async () => {
      const result = await TestModel.list({
        expand: ['links'],
      });
      const [firstElem] = result.data;
      expect(firstElem)
        .property('links')
        .length(1);
    });

    it('should expand nested field', async () => {
      const result = await TestModel.retrieve(test._id, {
        expand: ['links', 'links.link'],
      });
      const [elem] = result.links;
      expect(elem)
        .property('link')
        .an('object')
        .property('_id');
      expect(elem.link._id.toString()).eq(test._id.toString());
    });

    it('should expand object field in retrieve', async () => {
      const result = await RelatedTestModel.retrieve(relatedTest._id, {
        expand: ['link.extra', 'link.links'],
      });
      expect(result)
        .property('link')
        .an('object')
        .property('_id');
      expect(result.link._id.toString()).eq(test._id.toString());
    });

    it('should expand various nested fields', async () => {
      const result = await TestModel.retrieve(test._id, {
        expand: ['links', 'links.link.links', 'links.link.extra', 'extra'],
      });
      expect(result.links[0].link.extra).not.to.equal(null);
    });

    it('should expand object field in list', async () => {
      const result = await RelatedTestModel.list({
        expand: ['link'],
      });
      const [firstElem] = result.data as IRelatedTestModel[];
      expect(firstElem)
        .property('link')
        .an('object')
        .property('_id');
      // @ts-ignore
      expect(firstElem.link._id.toString()).eq(test._id.toString());
    });

    it('should expand local array field', async () => {
      await TestModel.update(test._id, {
        localLinks: [relatedTest._id],
      });

      const {
        data: [result],
      } = await TestModel.list({
        expand: ['localLinks'],
      });

      expect(result)
        .property('localLinks')
        .an('array');

      const [localLink] = result.localLinks;

      expect(localLink)
        .an('object')
        .property('_id');
      expect(localLink._id.toString()).eq(relatedTest._id.toString());
    });
  });

  describe('Pagination', () => {
    let tests: any[] = [];

    beforeEach(async () => {
      for (let i = 0; i < 10; i++) {
        await TestModel.create({
          numberField: getRandomInt(0, 100),
          // testField: i + 1,
        });
      }
      tests = await TestModel.collection.find({}).toArray();
    });

    afterEach(async () => {
      await Promise.all([TestModel.collection.deleteMany({})]);
      tests = [];
    });

    it('should get list without additional properties', async () => {
      const list = await TestModel.list();
      expect(list)
        .property('data')
        .length(tests.length);
      expect(list).property('nextUrl').is.null;
      expect(list).property('prevUrl').is.null;
    });

    it('should paginate forward', async () => {
      await paginateForward(tests);
    });

    it('should paginate backward', async () => {
      const lastResult = await paginateForward(tests);

      const list1 = await TestModel.list(qs.parse(lastResult.prevUrl));
      const list2 = await TestModel.list(qs.parse(list1.prevUrl));
      const list3 = await TestModel.list(qs.parse(list2.prevUrl));
      const list4 = await TestModel.list(qs.parse(list3.prevUrl));

      expect(tests[8]._id.toString()).eq(lastResult.data[0]._id.toString());
      expect(tests[9]._id.toString()).eq(lastResult.data[1]._id.toString());

      expect(list1.nextUrl).is.not.null;
      expect(list1.prevUrl).is.not.null;
      expect(tests[6]._id.toString()).eq(list1.data[0]._id.toString());
      expect(tests[7]._id.toString()).eq(list1.data[1]._id.toString());

      expect(list2.nextUrl).is.not.null;
      expect(list2.prevUrl).is.not.null;
      expect(tests[4]._id.toString()).eq(list2.data[0]._id.toString());
      expect(tests[5]._id.toString()).eq(list2.data[1]._id.toString());

      expect(list3.nextUrl).is.not.null;
      expect(list3.prevUrl).is.not.null;
      expect(tests[2]._id.toString()).eq(list3.data[0]._id.toString());
      expect(tests[3]._id.toString()).eq(list3.data[1]._id.toString());

      expect(list4.nextUrl).is.not.null;
      expect(list4.prevUrl).is.null;
      expect(tests[0]._id.toString()).eq(list4.data[0]._id.toString());
      expect(tests[1]._id.toString()).eq(list4.data[1]._id.toString());
    });

    it('should paginate forward with ascending sort', async () => {
      const sortedTestDocuments = tests.slice().sort(sortFieldBy('numberField'));
      await paginateForward(sortedTestDocuments, ['+numberField']);
    });

    it('should paginate backward with ascending sort', async () => {
      const sortedTestDocuments = tests.slice().sort(sortFieldBy('numberField'));
      const lastResult = await paginateForward(sortedTestDocuments, ['+numberField']);

      const list1 = await TestModel.list(qs.parse(lastResult.prevUrl));
      const list2 = await TestModel.list(qs.parse(list1.prevUrl));
      const list3 = await TestModel.list(qs.parse(list2.prevUrl));
      const list4 = await TestModel.list(qs.parse(list3.prevUrl));

      expect(sortedTestDocuments[8]._id.toString()).eq(lastResult.data[0]._id.toString());
      expect(sortedTestDocuments[9]._id.toString()).eq(lastResult.data[1]._id.toString());

      expect(list1.nextUrl).is.not.null;
      expect(list1.prevUrl).is.not.null;
      expect(sortedTestDocuments[6]._id.toString()).eq(list1.data[0]._id.toString());
      expect(sortedTestDocuments[7]._id.toString()).eq(list1.data[1]._id.toString());

      expect(list2.nextUrl).is.not.null;
      expect(list2.prevUrl).is.not.null;
      expect(sortedTestDocuments[4]._id.toString()).eq(list2.data[0]._id.toString());
      expect(sortedTestDocuments[5]._id.toString()).eq(list2.data[1]._id.toString());

      expect(list3.nextUrl).is.not.null;
      expect(list3.prevUrl).is.not.null;
      expect(sortedTestDocuments[2]._id.toString()).eq(list3.data[0]._id.toString());
      expect(sortedTestDocuments[3]._id.toString()).eq(list3.data[1]._id.toString());

      expect(list4.nextUrl).is.not.null;
      expect(list4.prevUrl).is.null;
      expect(sortedTestDocuments[0]._id.toString()).eq(list4.data[0]._id.toString());
      expect(sortedTestDocuments[1]._id.toString()).eq(list4.data[1]._id.toString());
    });

    it('should paginate forward with descending sort', async () => {
      const sortedTestDocuments = tests.slice().sort(sortFieldBy('numberField', 'desc'));
      await paginateForward(sortedTestDocuments, ['-numberField']);
    });

    it('should paginate backward with descending sort', async () => {
      const sortedTestDocuments = tests.slice().sort(sortFieldBy('numberField', 'desc'));
      const lastResult = await paginateForward(sortedTestDocuments, ['-numberField']);

      const list1 = await TestModel.list(qs.parse(lastResult.prevUrl));
      const list2 = await TestModel.list(qs.parse(list1.prevUrl));
      const list3 = await TestModel.list(qs.parse(list2.prevUrl));
      const list4 = await TestModel.list(qs.parse(list3.prevUrl));

      expect(sortedTestDocuments[8]._id.toString()).eq(lastResult.data[0]._id.toString());
      expect(sortedTestDocuments[9]._id.toString()).eq(lastResult.data[1]._id.toString());

      expect(list1.nextUrl).is.not.null;
      expect(list1.prevUrl).is.not.null;
      expect(sortedTestDocuments[6]._id.toString()).eq(list1.data[0]._id.toString());
      expect(sortedTestDocuments[7]._id.toString()).eq(list1.data[1]._id.toString());

      expect(list2.nextUrl).is.not.null;
      expect(list2.prevUrl).is.not.null;
      expect(sortedTestDocuments[4]._id.toString()).eq(list2.data[0]._id.toString());
      expect(sortedTestDocuments[5]._id.toString()).eq(list2.data[1]._id.toString());

      expect(list3.nextUrl).is.not.null;
      expect(list3.prevUrl).is.not.null;
      expect(sortedTestDocuments[2]._id.toString()).eq(list3.data[0]._id.toString());
      expect(sortedTestDocuments[3]._id.toString()).eq(list3.data[1]._id.toString());

      expect(list4.nextUrl).is.not.null;
      expect(list4.prevUrl).is.null;
      expect(sortedTestDocuments[0]._id.toString()).eq(list4.data[0]._id.toString());
      expect(sortedTestDocuments[1]._id.toString()).eq(list4.data[1]._id.toString());
    });
  });
});
