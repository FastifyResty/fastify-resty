import type { HTTPMethods, RouteShorthandOptions } from 'fastify';

const httpMethods: HTTPMethods[] = ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'];

function requestMethodFactory(methods: HTTPMethods | HTTPMethods[], url: string, options?: RouteShorthandOptions): MethodDecorator {
  return function(target: object, propertyKey: string | symbol): void {
    // apply method if string or array of methods received, otherwise set all possible methods
    const method = typeof methods === 'string' || (Array.isArray(methods) && methods.length > 0) ? methods : httpMethods;

    Reflect.defineMetadata('fastify-resty:handler', { url, method, ...options }, target, propertyKey);

    if (Reflect.hasMetadata('fastify-resty:handlers', target)) {
      const handlers: Set<string> = Reflect.getMetadata('fastify-resty:handlers', target);
      handlers.add(propertyKey.toString());
    } else {
      Reflect.defineMetadata('fastify-resty:handlers', new Set([ propertyKey ]), target);
    }
  }
}

export function GET(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('GET', route, options);
}

export function HEAD(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('HEAD', route, options);
}

export function PATCH(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('PATCH', route, options);
}

export function POST(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('POST', route, options);
}

export function PUT(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('PUT', route, options);
}

export function OPTIONS(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('OPTIONS', route, options);
}

export function DELETE(route: string, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory('DELETE', route, options);
}

export function ALL(route: string, methods?: HTTPMethods[] | null, options?: RouteShorthandOptions): MethodDecorator {
  return requestMethodFactory(methods, route, options);
}
