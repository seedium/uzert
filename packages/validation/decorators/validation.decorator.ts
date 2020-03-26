import { controllers, RouteSchema } from '../index';

export const schema = (routeSchema: RouteSchema) => {
  return (target: any, propertyKey: string) => {
    validation.addSchema(
      controllers,
      `${target.name}${propertyKey}`,
      routeSchema,
    );

    return target;
  };
};
