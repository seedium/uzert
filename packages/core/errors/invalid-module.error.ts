export class InvalidModuleError extends Error {
  constructor(parentModule: any, index?: number) {
    const parentModuleName = parentModule?.name || 'module';
    super(
      `Uzert cannot create the ${parentModuleName} instance.
Received an unexpected value at index [${index}] of the ${parentModuleName} "imports" array. `,
    );
  }
}
