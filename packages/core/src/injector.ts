import { FastifyToken } from './symbols';
import type { Constructable, IInjectToken } from './types';

/* global service tokens map */
export const serviceTokens: Map<IInjectToken, Constructable> = new Map();

export default class Injector {

  private readonly injectableMap: Map<Constructable | IInjectToken, any> = new Map();

  private resolve(constructor: Constructable | IInjectToken) {
    let currentInstance = this.injectableMap.get(constructor);
    if (currentInstance) return currentInstance;

    const fastifyInstance = this.injectableMap.get(FastifyToken);

    if (typeof constructor !== 'function') { // TODO check if constructable
      // service token
      if (serviceTokens.has(constructor)) {
        const serviceConstructor = serviceTokens.get(constructor);
        const serviceInstance = this.resolve(serviceConstructor);

        this.injectableMap.set(serviceConstructor, serviceInstance);
        this.injectableMap.set(constructor, serviceInstance);

        return serviceInstance;
      }

      // fastify decorated value
      return fastifyInstance[constructor];
    }

    const paramTypes: Constructable[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const injectedParams: Map<number, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:constructor', constructor) || new Map();
    const injectedModelParams: Map<number, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:constructor:model', constructor) || new Map();

    const constructorParams = paramTypes.map((param, index) => {
      if (injectedModelParams.has(index)) {
        const { Entity, options } = injectedModelParams.get(index) as any;
        return new fastifyInstance.BaseModel(Entity, options);
      }
      return this.resolve(injectedParams.get(index) || param)
    });

    // Inject static properties
    const injectStaticMap: Map<string, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:properties', constructor) || new Map();
    for (const [property, token] of injectStaticMap.entries()) {
      constructor[property] = this.resolve(token);
    }

    // Inject static model properties
    const injectModelStaticMap: Map<string, any> = Reflect.getMetadata('fastify-resty:inject:properties:model', constructor) || new Map();
    for (const [property, { Entity, options }] of injectModelStaticMap.entries()) {
      constructor[property] = new fastifyInstance.BaseModel(Entity, options);
    }
  
    currentInstance = Reflect.construct(constructor, constructorParams);
    
    // Inject instance properties
    const injectPropsMap: Map<string, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:properties', currentInstance) || new Map();
    for (const [property, token] of injectPropsMap.entries()) {
      currentInstance[property] = this.resolve(token);
    }

    // Inject instance model properties
    const injectModelPropsMap: Map<string, any> = Reflect.getMetadata('fastify-resty:inject:properties:model', currentInstance) || new Map();
    for (const [property, { Entity, options }] of injectModelPropsMap.entries()) {
      currentInstance[property] = new fastifyInstance.BaseModel(Entity, options);
    }

    this.injectableMap.set(constructor, currentInstance);

    return currentInstance;
  }

  public getInstance<T>(constructor: Constructable<T>): T {
    return this.resolve(constructor);
  }

  public registerInstance(key: Constructable | IInjectToken, value: any): void {
    this.injectableMap.set(key, value);
  }
}
