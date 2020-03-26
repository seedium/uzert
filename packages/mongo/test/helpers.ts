import TestModel from './examples/TestModel';
import { expect } from 'chai';
import * as qs from 'qs';
import { IList } from '../src';

export const sortFieldBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
  if (direction === 'asc') {
    return (a, b) => {
      if (a[field] > b[field]) {
        return 1;
      }
      if (a[field] < b[field]) {
        return -1;
      }

      return 0;
    };
  } else {
    return (a, b) => {
      if (a[field] < b[field]) {
        return 1;
      }
      if (a[field] > b[field]) {
        return -1;
      }

      return 0;
    };
  }
};

export const paginateForward = async (tests, sort: string[] = []): Promise<IList<any>> => {
  const limit = 2;
  const list1 = await TestModel.list({
    limit,
    sort,
  });
  const list2 = await TestModel.list(qs.parse(list1.nextUrl));
  const list3 = await TestModel.list(qs.parse(list2.nextUrl));
  const list4 = await TestModel.list(qs.parse(list3.nextUrl));
  const list5 = await TestModel.list(qs.parse(list4.nextUrl));

  expect(list1.nextUrl).is.not.null;
  expect(list1.prevUrl).is.null;
  expect(tests[0]._id.toString()).eq(list1.data[0]._id.toString());
  expect(tests[1]._id.toString()).eq(list1.data[1]._id.toString());

  expect(list2.nextUrl).is.not.null;
  expect(list2.prevUrl).is.not.null;
  expect(tests[2]._id.toString()).eq(list2.data[0]._id.toString());
  expect(tests[3]._id.toString()).eq(list2.data[1]._id.toString());

  expect(list3.nextUrl).is.not.null;
  expect(list3.prevUrl).is.not.null;
  expect(tests[4]._id.toString()).eq(list3.data[0]._id.toString());
  expect(tests[5]._id.toString()).eq(list3.data[1]._id.toString());

  expect(list4.nextUrl).is.not.null;
  expect(list4.prevUrl).is.not.null;
  expect(tests[6]._id.toString()).eq(list4.data[0]._id.toString());
  expect(tests[7]._id.toString()).eq(list4.data[1]._id.toString());

  expect(list5.nextUrl).is.null;
  expect(list5.prevUrl).is.not.null;
  expect(tests[8]._id.toString()).eq(list5.data[0]._id.toString());
  expect(tests[9]._id.toString()).eq(list5.data[1]._id.toString());

  return list5;
};
