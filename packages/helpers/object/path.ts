import paths from './paths';

export const path = (pathAr: any[], obj: any) => {
  return paths([pathAr], obj)[0];
};

export default path;
