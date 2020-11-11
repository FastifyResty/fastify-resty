import type { Constructable } from '../types';

export function Controller(route?: string): any {
  return function<T extends Constructable>(target: T) {
    Reflect.defineMetadata('fastify-resty:controller', { route }, target.prototype);
  }
}
