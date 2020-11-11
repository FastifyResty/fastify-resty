import { serviceTokens } from '../injector';

export function Service(token?: string | Symbol) {
  return function(target): void {
    if (typeof token === 'string' || typeof token === 'symbol') {
      serviceTokens.set(token, target);
    }
  }
}
