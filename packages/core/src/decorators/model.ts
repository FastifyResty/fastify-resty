import type { IModelOptions } from '../types';

export function Model(Entity, options?: IModelOptions) {
  return function (target, propertyKey: string, parameterIndex?: number): void {
    let metadataKey;
    if (typeof propertyKey === 'undefined' && typeof parameterIndex === 'number') {
      metadataKey = 'fastify-resty:inject:constructor:model';
    } else if (typeof propertyKey === 'string' && typeof parameterIndex === 'undefined') {
      metadataKey = 'fastify-resty:inject:properties:model';
    }

    if (metadataKey) {
      const injectMap: Map<string | number, any> = Reflect.getMetadata(metadataKey, target) || new Map();
      injectMap.set(propertyKey || parameterIndex, { Entity, options });
      Reflect.defineMetadata(metadataKey, injectMap, target);
    }
  }
}
