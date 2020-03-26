import { expect } from 'chai';
import { merge } from '../src';

describe('object', () => {
  it('should merge first level', () => {
    const target = {
      foo: 'bar',
      hello: 'world',
    };
    const source = {
      hello: 'override',
      extra: 'value',
    };

    const merged = merge(target, source);
    expect(merged).property('foo').eq(target.foo);
    expect(merged).property('hello').eq(source.hello);
    expect(merged).property('extra').eq(source.extra);
  });

  it('should deep merge', () => {
    const target = {
      foo: 'bar',
      deep: {
        hello: 'world',
        name: 'john',
      },
    };
    const source = {
      deep: {
        name: 'kostya',
      },
    };

    const merged = merge(target, source);
    expect(merged).property('foo').eq(target.foo);
    expect(merged).property('deep').property('hello').eq(target.deep.hello);
    expect(merged.deep).property('name').eq(source.deep.name);
  });
});
