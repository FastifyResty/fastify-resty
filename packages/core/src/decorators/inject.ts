import type { Constructable, IInjectToken } from '../types';

export function Inject(token?: IInjectToken) {
  return function(target, propertyKey: string, parameterIndex?: number): void {
    if (typeof propertyKey === 'undefined' && typeof parameterIndex === 'number') {
      const injectMap: Map<number, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:constructor', target) || new Map();
      injectMap.set(parameterIndex, token);

      Reflect.defineMetadata('fastify-resty:inject:constructor', injectMap, target);
    } else if (typeof propertyKey === 'string' && typeof parameterIndex === 'undefined') {
      const injectMap: Map<string, IInjectToken | Constructable> = Reflect.getMetadata('fastify-resty:inject:properties', target) || new Map();
      injectMap.set(propertyKey, token || Reflect.getMetadata('design:type', target, propertyKey));

      Reflect.defineMetadata('fastify-resty:inject:properties', injectMap, target);
    }
  }
}
