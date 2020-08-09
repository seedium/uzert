import isInteger from '../lang/isInteger';
import nth from '../lang/nth';

// eslint-disable-next-line
export const paths = (pathsArray: unknown[][], obj: unknown): any[] => {
  return pathsArray.map((nestedPaths) => {
    let val = obj;
    let idx = 0;
    let p;

    while (idx < nestedPaths.length) {
      if (val == null) {
        return undefined;
      }

      p = nestedPaths[idx];
      val = isInteger(p) ? nth(p, val as unknown[]) : val[p];
      idx += 1;
    }

    return val;
  });
};

export default paths;
