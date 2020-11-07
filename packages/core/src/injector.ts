import type { Constructable } from './types';

export default class Injector {

  private injectablesMap = new Map();

  private constructObject(constructor: Constructable) {
    let currentInstance = this.injectablesMap.get(constructor);
    if (currentInstance) return currentInstance;

    const paramtypes: Constructable[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
    const constructorParams = paramtypes.map(
      p => typeof p === 'function' ? this.constructObject(p) : p
    );

    currentInstance = Reflect.construct(constructor, constructorParams);
    this.injectablesMap.set(constructor, currentInstance);

    return currentInstance;
  }

  public getInstance<T>(constructor: Constructable<T>): T {
    return this.constructObject(constructor);
  }
}
