import { ContextId } from '../interfaces';

export const CONTROLLER_ID_KEY = 'CONTROLLER_ID';
const STATIC_CONTEXT_ID = 1;

export const STATIC_CONTEXT: ContextId = Object.freeze({
  id: STATIC_CONTEXT_ID,
});
