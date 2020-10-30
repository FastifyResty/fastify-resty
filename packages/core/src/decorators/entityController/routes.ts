import type { IControllerSchemas, IRouteOptions } from '../../types';

export default (routeSchemas: IControllerSchemas): IRouteOptions => ({
  find: {
    method: 'GET',
    url: '/',
    schema: {
      ...routeSchemas.find
    }
  },
  findOne: {
    method: 'GET',
    url: '/:id',
    schema: {
      ...routeSchemas.findOne
    }
  },
  create: {
    method: 'POST',
    url: '/',
    schema: {
      ...routeSchemas.create
    }
  },
  patch: {
    method: 'PATCH',
    url: '/',
    schema: {
      ...routeSchemas.patch
    }
  },
  patchOne: {
    method: 'PATCH',
    url: '/:id',
    schema: {
      ...routeSchemas.patchOne
    }
  },
  update: {
    method: 'PUT',
    url: '/',
    schema: {
      ...routeSchemas.update
    }
  },
  updateOne: {
    method: 'PUT',
    url: '/:id',
    schema: {
      ...routeSchemas.updateOne
    }
  },
  remove: {
    method: 'DELETE',
    url: '/',
    schema: {
      ...routeSchemas.remove
    }
  },
  removeOne: {
    method: 'DELETE',
    url: '/:id',
    schema: {
      ...routeSchemas.removeOne
    }
  }
});
