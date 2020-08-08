import isString from '../lang/isString';

const isJson = (text: string): boolean => {
  if (!isString(text)) {
    return false;
  }

  return /^[\],:{}\s]*$/.test(
    text
      .replace(/\\["\\\/bfnrtu]/g, '@')
      .replace(
        /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        ']',
      )
      .replace(/(?:^|:|,)(?:\s*\[)+/g, ''),
  );
};

export default isJson;
