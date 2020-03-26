export const createResponse = (schemas: any) => {
  return {
    res: {
      statusCode: 200,
    },
    context: {
      config: {
        schemas,
      },
    }
  };
};
