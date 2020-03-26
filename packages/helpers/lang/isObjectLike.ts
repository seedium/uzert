export default (value: any) => {
  return typeof value === 'object' && value !== null;
};
