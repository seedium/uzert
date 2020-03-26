import isInteger from '../lang/isInteger';
import nth from '../lang/nth';

export const paths = (pathsArray: any[], obj: any): any => {
  return pathsArray.map((nestedPaths) => {
    let val = obj;
    let idx = 0;
    let p;

    while (idx < nestedPaths.length) {
      if (val == null) {
        return undefined;
      }

      p = nestedPaths[idx];
      val = isInteger(p) ? nth(p, val) : val[p];
      idx += 1;
    }

    return val;
  });
};

export default paths;
