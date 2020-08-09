const isFunction = (fn: unknown): fn is Function => typeof fn === 'function';

export default isFunction;
