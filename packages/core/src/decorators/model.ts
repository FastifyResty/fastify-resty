import type { IModelOptions, Constructable } from '../types';

export function Model(Entity, options: IModelOptions) {
  return function <T extends Constructable>(constructor: T) {
    return class extends constructor {
      EntityClass = Entity;
      config = { // TODO: might be not needed in core package
        id: options.id || 'id',
        softDelete: options.softDelete !== undefined ? options.softDelete : false // TODO: TBD
      };
    }
  }
}
