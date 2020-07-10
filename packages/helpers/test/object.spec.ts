import { expect } from 'chai';
import { copy, merge, path, prop, paths } from '../object';

describe('Object', () => {
  describe('copy', () => {
    it('new object should not equal to source', () => {
      const sourceObject = {
        foo: 'bar',
        nest: {
          hello: 'world',
        },
      };
      const newObject = copy(sourceObject);
      expect(newObject).not.eq(sourceObject);
      expect(newObject).an('object').property('foo').eq(sourceObject.foo);
      expect(newObject).property('nest').property('hello').eq(sourceObject.nest.hello);
      expect(newObject.nest).not.eq(sourceObject.nest);
    });
    it('should not copy if source not plain object and return empty object', () => {
      class Test {}
      const sourceObject = new Test();
      const newObject = copy(sourceObject);
      expect(newObject).deep.eq({});
    });
  });
  describe('merge', () => {
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
    it('should merge if class has plain object', () => {
      class Test {
        public test = {
          foo: 'bar',
        };
      }
      const override = {
        foo: 'overrided',
        merge: {
          foo: 'bar',
        },
      };
      class TestOverride {
        public test = override;
      }
      const test = new Test();
      const testOverride = new TestOverride();
      const merged = merge(test, testOverride);
      expect(merged).property('test').deep.eq(override);
    });
  });
  describe('path', () => {
    it('should get nested path', () => {
      const obj = {
        nested: {
          deep: {
            foo: 'bar',
          },
        },
      };
      const result = path(['nested', 'deep', 'foo'], obj);
      expect(result).eq(obj.nested.deep.foo);
    });
  });
  describe('paths', () => {
    const obj = {
      a: {
        b: {
          c: 1,
          d: 2,
        },
      },
      p: [{ q: 3 }, 'Hi'],
      x: {
        y: 'Alice',
        z: [[{}]],
      },
    };
    it('if value not found should return undefined', () => {
      const [firstMath, secondMath] = paths(
        [
          ['p', 0, 'q'],
          ['x', 'z', 2, 1],
        ],
        obj,
      );
      expect(firstMath).eq(3);
      expect(secondMath).to.be.undefined;
    });
  });
  describe('prop', () => {
    const obj = {
      nested: {
        deep: {
          foo: 'bar',
        },
      },
    };
    it('should get nested path with default separator ":"', () => {
      const result = prop('nested:deep:foo')(obj);
      expect(result).eq(obj.nested.deep.foo);
    });
    it('should get nested path with custom separator', () => {
      const result = prop('nested.deep.foo', '.')(obj);
      expect(result).eq(obj.nested.deep.foo);
    });
  });
});
