import { IControllerRouter } from './controller-router.interface';

export type HighLevelHandler = () => void;
export type Handler = (router: IControllerRouter) => Promise<void>;
