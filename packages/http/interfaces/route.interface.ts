import { IControllerRouter } from './ControllerRouter.interface';

export type HighLevelHandler = () => void;
export type Handler = (router: IControllerRouter) => Promise<void>;
