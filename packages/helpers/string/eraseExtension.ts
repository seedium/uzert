const eraseExtension = (path: string) => {
  return path.split('.').slice(0, -1).join('.');
};

export default eraseExtension;
