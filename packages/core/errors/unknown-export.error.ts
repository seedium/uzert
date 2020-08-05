import { isSymbol } from '@uzert/helpers';

export class UnknownExportError extends Error {
  constructor(token: string | symbol, moduleName: string) {
    token = isSymbol(token) ? token.toString() : token;
    super(`Uzert cannot export a provider/module that is not a part of the currently processed module (${moduleName}). Please verify whether the exported ${token} is available in this particular context.

Possible Solutions:
- Is ${token} part of the relevant providers/imports within ${moduleName}?
`);
  }
}
