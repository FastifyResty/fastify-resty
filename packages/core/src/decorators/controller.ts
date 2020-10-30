import type { FastifyInstance } from 'fastify';

export function Controller(route?: string): any {
  return function<T extends { new (...args: any[]): {} }>(target: T) {
    const origin = target;

    const constructorFn = function(...args: [FastifyInstance, ...any[]]) {
      const controllerInstance = Reflect.construct(origin, args);
      controllerInstance.instance = args[0];

      controllerInstance.prototype = origin.prototype;

      return controllerInstance;
    };

    constructorFn.prototype = origin.prototype;

    Reflect.defineMetadata('fastify-resty:controller', { route }, origin.prototype);

    return constructorFn;
  }
}
