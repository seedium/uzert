import { controllers } from '../constants';
import { RouteSchema } from '../interfaces';
import Validation from '../providers/validation.provider';

export const schema = (routeSchema: RouteSchema) => {
  return (target: any, propertyKey: string) => {
    Validation.addSchema(controllers, `${target.name}${propertyKey}`, routeSchema);

    return target;
  };
};
