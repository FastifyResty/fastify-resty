type ControllerHooks = 'onRequest' | 'preParsing' | 'preValidation' | 'preHandler' | 'preSerialization' | 'onError' | 'onSend' | 'onResponse' | 'onTimeout';

function hookFactory(event: ControllerHooks) {
  return function(target: object, propertyKey: string | symbol): void {
    Reflect.defineMetadata('fastify-resty:hook', { event }, target, propertyKey);

    if (Reflect.hasMetadata('fastify-resty:hooks', target)) {
      const hooks: Set<string> = Reflect.getMetadata('fastify-resty:hooks', target);
      hooks.add(propertyKey.toString());
    } else {
      Reflect.defineMetadata('fastify-resty:hooks', new Set([ propertyKey ]), target);
    }
  }
}

export const OnRequest = hookFactory('onRequest');

export const PreParsing = hookFactory('preParsing');

export const PreValidation = hookFactory('preValidation');

export const PreHandler = hookFactory('preHandler');

export const PreSerialization = hookFactory('preSerialization');

export const OnError = hookFactory('onError');

export const OnSend = hookFactory('onSend');

export const OnResponse = hookFactory('onResponse');

export const OnTimeout = hookFactory('onTimeout');
