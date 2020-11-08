import { FastifyInstance } from 'fastify';
import type { Constructable } from './types';

const fastifyInstanceToken = 'FASTIFY';

type IInjectToken = string | Symbol;

export default class Injector {

  static readonly serviceTokens: Map<IInjectToken, Constructable> = new Map();

  private readonly injectableMap: Map<Constructable | IInjectToken, any> = new Map();

  constructor(fastifyInstance: FastifyInstance) {
    this.injectableMap.set(fastifyInstanceToken, fastifyInstance);
  }

  private resolve(constructor: Constructable | IInjectToken) {
    let currentInstance = this.injectableMap.get(constructor);
    if (currentInstance) return currentInstance;

    if (typeof constructor !== 'function') { // TODO check if constructable
      // service token
      if (Injector.serviceTokens.has(constructor)) {
        const serviceConstructor = Injector.serviceTokens.get(constructor);
        const serviceInstance = this.resolve(serviceConstructor);

        this.injectableMap.set(serviceConstructor, serviceInstance);
        this.injectableMap.set(constructor, serviceInstance);

        Injector.serviceTokens.delete(constructor);

        return serviceInstance;
      }

      // fastify decorated value
      const fastifyInstance = this.injectableMap.get(fastifyInstanceToken);
      return fastifyInstance[constructor.toString()]; // TODO get by Symbol
    }

    const paramTypes: Constructable[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const injectedParams: Map<number, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:constructor', constructor) || new Map();

    const constructorParams = paramTypes.map((param, index) => this.resolve(injectedParams.get(index) || param));

    // Inject static properties
    const injectStaticMap: Map<string, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:properties', constructor) || new Map();
    for (const [property, token] of injectStaticMap.entries()) {
      constructor[property] = this.resolve(token);
    }
  
    currentInstance = Reflect.construct(constructor, constructorParams);
    
    // Inject instance properties
    const injectPropsMap: Map<string, IInjectToken> = Reflect.getMetadata('fastify-resty:inject:properties', currentInstance) || new Map();
    for (const [property, token] of injectPropsMap.entries()) {
      currentInstance[property] = this.resolve(token);
    }

    this.injectableMap.set(constructor, currentInstance);

    return currentInstance;
  }

  public getInstance<T>(constructor: Constructable<T>): T {
    return this.resolve(constructor);
  }
}
