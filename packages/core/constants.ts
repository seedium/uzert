export const MODULE_KEYS = {
  PROVIDERS: 'providers',
  CONTROLLERS: 'controllers',
  ROUTES: 'routes',
};
export const METADATA_PARAMTYPES = 'design:paramtypes';
export const SELF_DECLARED_DEPS_METADATA = 'self:paramtypes';
export const SCOPE_OPTIONS_METADATA = 'scope:options';
export const PROPERTY_DEPS_METADATA = 'self:properties_metadata';
export const OPTIONAL_PROPERTY_DEPS_METADATA = 'optional:properties_metadata';

export const INSTANCE_ID_SYMBOL = Symbol.for('instance_metadata:id');
export const INSTANCE_METADATA_SYMBOL = Symbol.for('instance_metadata:cache');

export const PIPES_METADATA = '__pipes__';
export const ROUTER_OPTIONS = '__options__';
export const ROUTER_INSTANCE = '__instance__';
