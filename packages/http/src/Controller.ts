import { IControllerDefinition } from './index';

export default class Controller {
  public static async loadController(controller: string): Promise<IControllerDefinition> {
    const [controllerPath, controllerMethod] = controller.split('@');

    if (!controllerPath || !controllerMethod) {
      throw new Error('Bad controller definitions');
    }

    // dynamic require controller
    const controllerInstance = (await import('app/Controllers/' + controllerPath)).default;

    return {
      path: 'app/controllers/' + controllerPath,
      method: controllerMethod,
      instance: controllerInstance,
    };
  }
}
