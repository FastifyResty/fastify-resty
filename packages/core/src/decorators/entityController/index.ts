import hooks from './hooks';
import methods from './methods';
import getRoutes from './routes';
import { createControllerConfig } from '../../configurations';
import { baseSchema, schemaDefinitions } from './schemaBuilder';
import { Initialize } from '../../symbols';
import type { FastifyInstance } from 'fastify';
import type { IControllerConfig, IControllerOptions, IModelOptions, IBaseModel, Constructable } from '../../types';


export function EntityController<E extends Object>(Entity: E, route?: string, options?: IControllerOptions & IModelOptions): any {
  return function<T extends Constructable>(target: T) {
    const origin = target;

    const handlersSet = Reflect.getMetadata('fastify-resty:handlers', origin.prototype) || new Set();
    const hooksSet = Reflect.getMetadata('fastify-resty:hooks', origin.prototype) || new Set();

    (origin as any).prototype[Initialize] = function(fastifyInstance: FastifyInstance & { BaseModel?: new(...args) => IBaseModel<E> }, defaultConfig: IControllerConfig) {
      if (!fastifyInstance.BaseModel && typeof fastifyInstance !== 'function') {
        throw new Error('Database connector is not bootstrapped! Missing Model class');
      }

      this.config = createControllerConfig(options, defaultConfig);
      this.model = new fastifyInstance.BaseModel(Entity, this.config);

      const { jsonSchema } = this.model;

      const definitions = schemaDefinitions(jsonSchema);
      Reflect.defineMetadata('fastify-resty:definitions', definitions, origin.prototype);

      const routeSchemas = baseSchema(`/${this.model.name}.json`, jsonSchema);
      const routeOptions = getRoutes(routeSchemas);

      // register base entity methods
      Object.keys(methods).forEach(methodKey => {
        Reflect.defineProperty(origin.prototype, methodKey, {
          enumerable: true,
          value: methods[methodKey]
        });

        handlersSet.add(methodKey);
        Reflect.defineMetadata('fastify-resty:handler', routeOptions[methodKey], origin.prototype, methodKey);
      });

      // register base entity hooks
      if (!this.config.allowMulti || Array.isArray(this.config.methods)) {
        const hookHandlerKey = 'validateAllowedMethods';
        
        Reflect.defineProperty(origin.prototype, hookHandlerKey, {
          enumerable: true,
          value: hooks[hookHandlerKey].handler(routeOptions, route)
        });

        hooksSet.add(hookHandlerKey);
        Reflect.defineMetadata('fastify-resty:hook', { event: 'onRequest' }, origin.prototype, hookHandlerKey);
      }
    }

    Reflect.defineMetadata('fastify-resty:controller', { Entity, route }, origin.prototype);
    Reflect.defineMetadata('fastify-resty:handlers', handlersSet, origin.prototype);
    Reflect.defineMetadata('fastify-resty:hooks', hooksSet, origin.prototype);

    return origin;
  }
}
