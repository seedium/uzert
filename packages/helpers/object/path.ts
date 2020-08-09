import paths from './paths';

export const path = <T = unknown>(pathAr: unknown[], obj: unknown): T => {
  return paths([pathAr], obj)[0];
};

export default path;
