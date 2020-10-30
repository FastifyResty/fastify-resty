import { get } from './helpers';
import type { IApplicationConfig, IApplicationOptions, IControllerConfig, IControllerOptions, IBaseControllerMethods, IPagination } from './types';

const defaultPagination: IPagination = { limit: 20, total: true };

export const createAppConfig = (options: IApplicationOptions): IApplicationConfig => {
  const pagination = typeof options.defaults?.pagination === 'boolean'
    ? options.defaults?.pagination && defaultPagination
    : { ...defaultPagination, ...get(options.defaults?.pagination, {}) };

  return {
    controllers: options.controllers,
    entry: options.entry,
    pattern: options.pattern || /\.controller\.[jt]s$/,
    defaults: {
      pagination,
      id: options.defaults?.id || 'id',
      softDelete: Boolean(options.defaults?.softDelete),
      methods: options.defaults?.methods,
      allowMulti: get(options.defaults?.allowMulti, true),
      returning: get(options.defaults?.returning, true)
    }
  };
}

export const createControllerConfig = (options: IControllerOptions = {}, defaults: IControllerConfig): IControllerConfig => {
  let pagination;
  if (typeof options.pagination === 'boolean') {
    pagination = options.pagination && defaultPagination;
  } else if (typeof options.pagination === 'object') {
    pagination = { ...((defaults.pagination as false | object) || {}), ...options.pagination };
  } else {
    pagination = defaults.pagination;
  }

  return Object.assign({}, defaults, options, { pagination });
}

export const getAllowedMethods = (config: IControllerConfig): Array<IBaseControllerMethods> => {
  let allowedMethods: Array<IBaseControllerMethods> = ['find', 'findOne', 'create', 'patch', 'patchOne', 'update', 'updateOne', 'remove', 'removeOne'];

  // apply allowMulti
  if (!config.allowMulti) {
    const multiMethods = ['find', 'patch', 'update', 'remove'];
    allowedMethods = allowedMethods.filter(key => !multiMethods.includes(key));
  }

  // apply specified methods
  if (config.methods) {
    allowedMethods = allowedMethods.filter(key => config.methods.includes(key));
  }

  return allowedMethods;
}
