import Injector from '../injector';

export function Service(token?: string | Symbol) {
  return function(target): void {
    if (typeof token !== 'undefined') {
      Injector.serviceTokens.set(token, target);
    }
  }
}
