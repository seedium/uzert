import { expect } from 'chai';
import { ObjectId } from 'bson';
import * as qs from 'qs';
// models
import TestModel from './examples/TestModel';
import { IPageInfo } from '../src';

describe('Cursor', () => {
  it('should get empty cursor', () => {
    const { match, sort } = TestModel.getCursor([]);
    expect(match).an('object');
    expect(sort).an('object');

    const matchKeys = Object.keys(match);
    const sortKeys = Object.keys(sort);

    expect(matchKeys).length(0);
    expect(sortKeys).length(0);
  });

  it('should return ascending sort mongo object', () => {
    const field = 'created';

    const { match, sort } = TestModel.getCursor([`+${field}`]);

    expect(match).an('object');
    expect(sort).an('object');

    const matchKeys = Object.keys(match);
    const sortKeys = Object.keys(sort);
    expect(matchKeys).length(0);
    expect(sortKeys).length(1);

    expect(sort)
      .property(field)
      .eq(1);
  });

  it('should return descending sort mongo object', () => {
    const field = 'created';

    const { match, sort } = TestModel.getCursor([`-${field}`]);

    expect(match).an('object');
    expect(sort).an('object');

    const matchKeys = Object.keys(match);
    const sortKeys = Object.keys(sort);
    expect(matchKeys).length(0);
    expect(sortKeys).length(1);

    expect(sort)
      .property(field)
      .eq(-1);
  });

  it('should return _id greater than with empty sort', () => {
    const pageInfo: IPageInfo = {
      direction: 'next',
      _id: new ObjectId(),
    };

    const { match } = TestModel.getCursor([], pageInfo);
    expect(match)
      .property('_id')
      .property('$gt');
    expect(match._id.$gt.toString()).eq(pageInfo._id.toString());
  });

  it('should return _id less than with empty sort', () => {
    const pageInfo: IPageInfo = {
      direction: 'prev',
      _id: new ObjectId(),
    };

    const { match, sort } = TestModel.getCursor([], pageInfo);
    expect(match)
      .property('_id')
      .property('$lt');
    expect(match._id.$lt.toString()).eq(pageInfo._id.toString());
    expect(sort)
      .property('_id')
      .eq(-1);
  });

  it('should return _id greater than with sort by one field', () => {
    const sortField = 'created';
    const pageInfo: IPageInfo = {
      direction: 'next',
      _id: new ObjectId(),
      [sortField]: 14567788997,
    };
    const { match, sort } = TestModel.getCursor([`+${sortField}`], pageInfo);

    // check match query
    expect(match)
      .property('$or')
      .an('array');
    const [firstCondition, secondCondition] = match.$or;
    expect(firstCondition)
      .property(sortField)
      .property('$gt')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property('_id')
      .property('$gt');
    expect(secondCondition._id.$gt.toString()).eq(pageInfo._id.toString());

    // check sort query
    expect(Object.keys(sort)).length(2);
    expect(sort)
      .property(sortField)
      .eq(1);
    expect(sort)
      .property('_id')
      .eq(1);
  });

  it('should return _id less than with sort by one field', () => {
    const sortField = 'created';
    const pageInfo: IPageInfo = {
      direction: 'prev',
      _id: new ObjectId(),
      [sortField]: 14567788997,
    };
    const { match, sort } = TestModel.getCursor([`-${sortField}`], pageInfo);

    // check match query
    const [firstCondition, secondCondition] = match.$or;
    expect(firstCondition)
      .property(sortField)
      .property('$gt')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property('_id')
      .property('$lt');
    expect(secondCondition._id.$lt.toString()).eq(pageInfo._id.toString());

    // check sort query
    expect(Object.keys(sort)).length(2);
    expect(sort)
      .property(sortField)
      .eq(1);
    expect(sort)
      .property('_id')
      .eq(-1);
  });

  it('should return _id greater than with sort by two field', () => {
    const sortField = 'created';
    const sortField2 = 'title';
    const pageInfo: IPageInfo = {
      direction: 'next',
      _id: new ObjectId(),
      [sortField]: 14567788997,
      [sortField2]: 'Example',
    };
    const { match } = TestModel.getCursor([`-${sortField}`, `+${sortField2}`], pageInfo);

    const [firstCondition, secondCondition, thirdCondition] = match.$or;
    expect(firstCondition)
      .property(sortField)
      .property('$lt')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField2)
      .property('$gt')
      .eq(pageInfo[sortField2]);

    expect(thirdCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(thirdCondition)
      .property(sortField2)
      .property('$eq')
      .eq(pageInfo[sortField2]);
    expect(thirdCondition)
      .property('_id')
      .property('$gt');
    expect(thirdCondition._id.$gt.toString()).eq(pageInfo._id.toString());
  });

  it('should return _id less than with sort by two field', () => {
    const sortField = 'created';
    const sortField2 = 'title';
    const pageInfo: IPageInfo = {
      direction: 'prev',
      _id: new ObjectId(),
      [sortField]: 14567788997,
      [sortField2]: 'Example',
    };
    const { match } = TestModel.getCursor([`+${sortField}`, `-${sortField2}`], pageInfo);

    const [firstCondition, secondCondition, thirdCondition] = match.$or;
    expect(firstCondition)
      .property(sortField)
      .property('$lt')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(secondCondition)
      .property(sortField2)
      .property('$gt')
      .eq(pageInfo[sortField2]);

    expect(thirdCondition)
      .property(sortField)
      .property('$eq')
      .eq(pageInfo[sortField]);
    expect(thirdCondition)
      .property(sortField2)
      .property('$eq')
      .eq(pageInfo[sortField2]);
    expect(thirdCondition)
      .property('_id')
      .property('$lt');
    expect(thirdCondition._id.$lt.toString()).eq(pageInfo._id.toString());
  });

  it('should prepare all data passed to list query for next url', () => {
    const limit = 2;
    const expand = ['extra'];
    const include = ['totalCount'];
    const sort = ['created'];
    const numberField = 5;
    const created = {
      gt: Date.now(),
    };

    const response = TestModel.prepareListResponse({
      // @ts-ignore
      data: [1, 2, 3],
      limit,
      pageInfo: null,
      expand,
      include,
      sort,
      numberField,
      created,
    });

    const nextOptions = qs.parse(response.nextUrl);

    expect(nextOptions)
      .property('limit')
      .eq(`${limit}`);
    expect(nextOptions)
      .property('sort')
      .an('array')
      .length(sort.length);
    expect(nextOptions.sort[0]).eq(sort[0]);
    expect(nextOptions).property('pageInfo');

    const pageInfo = TestModel.decodePageInfo(nextOptions.pageInfo);
    expect(pageInfo)
      .property('direction')
      .eq('next');

    // other values
    expect(nextOptions)
      .property('include')
      .an('array')
      .length(include.length);
    expect(nextOptions.include[0]).eq(include[0]);
    expect(nextOptions)
      .property('created')
      .an('object')
      .property('gt')
      .eq(`${created.gt}`);
    expect(nextOptions)
      .property('expand')
      .an('array')
      .length(expand.length);
    expect(nextOptions.expand[0]).eq(expand[0]);
    expect(nextOptions)
      .property('numberField')
      .eq(`${numberField}`);
  });
});
