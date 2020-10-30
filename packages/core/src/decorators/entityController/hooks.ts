import createError from 'http-errors';
import { getAllowedMethods } from '../../configurations';
import type { FastifyRequest } from 'fastify';

export default {
  validateAllowedMethods: {
    event: 'onRequest',
    handler: function(routeOptions, route) {
      return async function(request: FastifyRequest): Promise<void> {
        const allowedMethods = getAllowedMethods(this.config);
        const handlerKey = Object.keys(routeOptions).find(
          (key) =>
            routeOptions[key].method === request.routerMethod &&
            routeOptions[key].url === request.routerPath.replace(route || '/', '')
        );

        if (handlerKey && !allowedMethods.includes(handlerKey as any)) {
          throw createError(405, `Method ${request.routerMethod} is not allowed here`);
        }
      };
    }
  }
};
