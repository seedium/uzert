const eraseExtension = (path: string): string => {
  const chunks = path.split('.');
  if (chunks.length === 1) {
    return chunks.join('.');
  }
  return chunks.slice(0, -1).join('.');
};

export default eraseExtension;
