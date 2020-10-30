import { EntityController } from '../../../src/decorators/entityController';
import { GET } from '../../../src/decorators/requestMethods';
import { PreHandler } from '../../../src/decorators/hooks';
import { bootstrap } from '../../../src/bootstrap';
import entityControllerMethods from '../../../src/decorators/entityController/methods';
import fastify, { FastifyInstance } from 'fastify';
import ModelMock, * as ModelMockMethods from '../../support/ModelMock';

@EntityController({}, '/entity')
class EntityControllerTest {
  @GET('/custom', {
    schema: {
      querystring: {
        flag: { type: 'boolean' }
      }
    }
  })
  async getCustom(): Promise<void> {
    return;
  }

  @PreHandler
  async preHandlerHook(): Promise<void> {
    return;
  }
}

@EntityController(class EntityOne {})
class EntityControllerRoot {}

describe('@EntityController decorator', () => {
  const spies: Record<string, jest.SpyInstance> = {};
  let server: FastifyInstance;

  beforeAll(async () => {
    spies.getCustom = jest.spyOn(EntityControllerTest.prototype, 'getCustom');
    spies.preHandlerHook = jest.spyOn(EntityControllerTest.prototype, 'preHandlerHook');

    spies.find = jest.spyOn(entityControllerMethods, 'find');
    spies.findOne = jest.spyOn(entityControllerMethods, 'findOne');
    spies.create = jest.spyOn(entityControllerMethods, 'create');
    spies.patch = jest.spyOn(entityControllerMethods, 'patch');
    spies.patchOne = jest.spyOn(entityControllerMethods, 'patchOne');
    spies.update = jest.spyOn(entityControllerMethods, 'update');
    spies.updateOne = jest.spyOn(entityControllerMethods, 'updateOne');
    spies.remove = jest.spyOn(entityControllerMethods, 'remove');
    spies.removeOne = jest.spyOn(entityControllerMethods, 'removeOne');
  });

  beforeEach(() => {
    server = fastify();
    server.decorate('Model', ModelMock);
  });

  afterEach(() => {
    server.close();
    ModelMock.mockClear();

    Object.values(spies).forEach(spy => spy.mockClear());
    Object.values(ModelMockMethods).forEach(mock => mock.mockClear());
  });

  describe('EntityController register', () => {
    let bootstrapResult;

    beforeEach(async () => {
      bootstrapResult = await bootstrap(server, { controllers: [EntityControllerTest, EntityControllerRoot] });
    });

    test('Should register with an empty "route" option', async () => {
      // arrange
      const data = [{ id: 1, name: 'Jhon Doe' }, { id: 2, name: 'Lukas' }];
      ModelMockMethods.find.mockResolvedValue(data);
      ModelMockMethods.total.mockResolvedValue(data.length);

      // act
      const result = await server.inject({ method: 'GET', url: '/' });

      // assert
      expect(result.statusCode).toBe(200);
      expect(result.statusMessage).toBe('OK');
      expect(JSON.parse(result.body)).toMatchObject({ total: data.length, limit: 20, skip: 0, data });
    });

    test('Should register custom endpoint', async () => {
      // arrange
      spies.getCustom.mockResolvedValue([]);

      // act
      const result = await server.inject({ method: 'GET', url: '/entity/custom', query: { flag: 'true' } });
  
      // assert
      expect(result.statusCode).toBe(200);
      expect(result.statusMessage).toBe('OK');
      expect(result.body).toBe('[]');

      expect(spies.getCustom).toBeCalledTimes(1);
      expect(spies.getCustom.mock.calls[0]).toHaveLength(2);
      expect(spies.getCustom.mock.calls[0][0].query.flag).toBe(true);
      expect(spies.getCustom.mock.calls[0][0].params).toEqual({});
      expect(spies.getCustom.mock.calls[0][0].body).toBeNull();
    });

    test('Should register controller hook', async () => {
      // act
      const customResult = await server.inject({ method: 'GET', url: '/entity/custom' });
      const generatedResult = await server.inject({ method: 'GET', url: '/entity/' });
  
      // assert
      expect(customResult.statusCode).toBe(200);
      expect(generatedResult.statusCode).toBe(200);

      expect(spies.preHandlerHook).toHaveBeenCalledTimes(2);
      expect(spies.preHandlerHook.mock.calls[0]).toHaveLength(3);
      expect(spies.preHandlerHook.mock.calls[1]).toHaveLength(3);
    });

    test('Should add app instance as controller property', () => {
      const controllerInstance = bootstrapResult.controllers[0];

      expect(controllerInstance).toHaveProperty('instance');
      expect(controllerInstance.instance).toHaveProperty('getSchema');
      expect(controllerInstance.instance).toHaveProperty('fastify-resty-config');

      // TODO: better way to check fastify instance (kind of instanceof)
    });

    test('Should add controller model instance as controller property', () => {
      const controllerInstance = bootstrapResult.controllers[0];

      expect(controllerInstance).toHaveProperty('model');
      // TODO: better way to check mocked model instance (kind of instanceof)
    });

    test('Should use qs queryparser', async () => {
      await server.inject({ method: 'GET', url: '/entity/?$where[title]=How are you&$where[id][$lt]=10&$where[age][$gte]=18&$where[age][$lte]=65&$where[$or][0][name]=Danila&$where[$or][1][lastname][$in][]=Demidovich&$where[$or][1][lastname][$in][]=Fadeev' });

      expect(spies.find).toBeCalledTimes(1);
      expect(spies.find.mock.calls[0][0].query).toMatchObject({
        $where: {
          title: 'How are you',
          id: { $lt: 10 },
          age: { $gte: '18', $lte: '65' },
          $or: [{
            name: 'Danila'
          }, {
            lastname: {
              $in: ['Demidovich', 'Fadeev']
            }
          }]
        }
      });
    });

  });

  describe('Basic entity controller methods', () => {

    beforeEach(async () => {
      await bootstrap(server, { controllers: [EntityControllerTest] });
    });

    describe('Find (@GET) method', () => {

      test('Should register findAll route', async () => {  
        // act
        const result = await server.inject({ method: 'GET', url: '/entity/' });
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(spies.find).toBeCalledTimes(1);
      });

    });

    describe('FindOne (@GET) method', () => {

      test('Should register findOne route', async () => {
        // arrange
        const data = { id: 1, name: 'Jhon Doe' };
        ModelMockMethods.find.mockResolvedValue([data]);

        // act
        const result = await server.inject({ method: 'GET', url: '/entity/1' });

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject(data);

        expect(spies.findOne).toBeCalledTimes(1);
        expect(ModelMockMethods.find).toBeCalledTimes(1);
        expect(ModelMockMethods.find).toHaveBeenCalledWith({ $where: { id: '1' } });
      });

      test('Should throw 404 Not Fount error', async () => {
        // arrange
        ModelMockMethods.find.mockResolvedValue([]);

        // act
        const result = await server.inject({ method: 'GET', url: '/entity/356' });

        // assert
        expect(result.statusCode).toBe(404);
        expect(result.statusMessage).toBe('Not Found');
        expect(result.body).toBe(JSON.stringify({ statusCode: 404, error: 'Not Found', message: 'undefined #356 is not found' }));

        expect(spies.findOne).toBeCalledTimes(1);
        expect(ModelMockMethods.find).toBeCalledTimes(1);
        expect(ModelMockMethods.find).toHaveBeenCalledWith({ $where: { id: '356' } });
      });

    });

    describe('Create (@POST) method', () => {

      test('Should register create route', async () => {
        // arrange
        ModelMockMethods.create.mockResolvedValue({ identifiers: [3] });
        ModelMockMethods.find.mockReturnValue([{ id: 3, name: 'NEW name' }])

        // act
        const result = await server.inject({ method: 'POST', url: '/entity', body: { name: 'NEW name' } } as any);

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject([{ id: 3, name: 'NEW name' }]);

        expect(spies.create).toBeCalledTimes(1);
        expect(ModelMockMethods.create).toBeCalledTimes(1);
        expect(ModelMockMethods.create).toHaveBeenCalledWith({ name: 'NEW name' });
      });

    });

    describe('PatchOne (@PATCH) method', () => {

      test('Should register patchOne route', async () => {
        // arrange
        ModelMockMethods.patch.mockResolvedValue({ affected: 1 });
        ModelMockMethods.find.mockReturnValue([{ id: 12, name: 'PATCHED' }])
  
        // act
        const result = await server.inject({ method: 'PATCH', url: '/entity/12', body: { name: 'PATCHED' } } as any);
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ id: 12, name: 'PATCHED' });
  
        expect(spies.patchOne).toBeCalledTimes(1);
        expect(ModelMockMethods.patch).toBeCalledTimes(1);
        expect(ModelMockMethods.patch).toHaveBeenCalledWith({ id: '12' }, { name: 'PATCHED' }); // TODO 12 is number
      });
  
    });

    describe('Patch (@PATCH) method', () => {

      test('Should register patch route', async () => {
        // arrange
        const data = [{ id: 1, name: 'PATCHED' }, { id: 2, name: 'PATCHED' }, { id: 3, name: 'PATCHED' }, { id: 4, name: 'PATCHED' }];
        ModelMockMethods.patch.mockResolvedValue({ affected: 4 });
        ModelMockMethods.find.mockReturnValue(data)
  
        // act
        const result = await server.inject({ method: 'PATCH', url: '/entity?id[$in]=1&id[$in]=2&id[$in]=3&id[$in]=4', body: { name: 'PATCHED' } } as any);
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ affected: 4, data });
  
        expect(spies.patch).toBeCalledTimes(1);
        expect(ModelMockMethods.patch).toBeCalledTimes(1);
        expect(ModelMockMethods.patch).toHaveBeenCalledWith({ id: { $in: [1, 2, 3, 4] } }, { name: 'PATCHED' });
      });
  
    });

    describe('UpdateOne (@PUT) method', () => {
  
      test('Should register updateOne route', async () => {
        // arrange
        ModelMockMethods.update.mockResolvedValue({ affected: 1 });
        ModelMockMethods.find.mockReturnValue([{ id: 22, name: 'UPDATED' }])
  
        // act
        const result = await server.inject({ method: 'PUT', url: '/entity/22', body: { id: 22, name: 'UPDATED' } } as any);
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ id: 22, name: 'UPDATED' });
  
        expect(spies.updateOne).toBeCalledTimes(1);
        expect(ModelMockMethods.update).toBeCalledTimes(1);
        expect(ModelMockMethods.update).toHaveBeenCalledWith({ id: '22' }, { id: 22, name: 'UPDATED' }); // TODO 22 is number
      });
  
    });

    describe('Update (@PUT) method', () => {

      test('Should register update route', async () => {
        // arrange
        const data = [{ id: 3, name: 'UPDATED' }, { id: 72, name: 'UPDATED' }];
        ModelMockMethods.update.mockResolvedValue({ affected: 2 });
        ModelMockMethods.find.mockReturnValue(data)
  
        // act
        const result = await server.inject({ method: 'PUT', url: '/entity?age[$lte]=20', body: { name: 'UPDATED' } } as any);
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ affected: 2, data });
  
        expect(spies.update).toBeCalledTimes(1);
        expect(ModelMockMethods.update).toBeCalledTimes(1);
        expect(ModelMockMethods.update).toHaveBeenCalledWith({ age: { $lte: '20' } }, { name: 'UPDATED' }); // TODO 20 is number here
      });

    });

    describe('RemoveOne (@DELETE) method', () => {
  
      test('Should register removeOne route', async () => {
        // arrange
        ModelMockMethods.remove.mockResolvedValue({ affected: 1 });
        ModelMockMethods.find.mockReturnValue([{ id: 123, name: 'REMOVED' }])
  
        // act
        const result = await server.inject({ method: 'DELETE', url: '/entity/123' });
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ id: 123, name: 'REMOVED' });
  
        expect(spies.removeOne).toBeCalledTimes(1);
        expect(ModelMockMethods.remove).toBeCalledTimes(1);
        expect(ModelMockMethods.remove).toHaveBeenCalledWith({ id: '123' }); // TODO 123 is number
      });
  
    });

    describe('Remove (@DELETE) method', () => {

      test('Should register remove route', async () => {
        // arrange
        const data = [{ id: 1, name: 'REMOVED' }, { id: 2, name: 'REMOVED' }];
        ModelMockMethods.remove.mockResolvedValue({ affected: 2 });
        ModelMockMethods.find.mockReturnValue(data)
  
        // act
        const result = await server.inject({ method: 'DELETE', url: '/entity?name[$ilike]=%_ends' });
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(JSON.parse(result.body)).toMatchObject({ affected: 2, data });
  
        expect(spies.remove).toBeCalledTimes(1);
        expect(ModelMockMethods.remove).toBeCalledTimes(1);
        expect(ModelMockMethods.remove).toHaveBeenCalledWith({ name: { $ilike: '%_ends' } });
      });

    });

  });

  describe('Configuration', () => {

    beforeEach(() => {
      ModelMockMethods.find.mockResolvedValue([{ id: 1, name: 'Jhon Doe' }]);
      ModelMockMethods.total.mockResolvedValue(1);
      ModelMockMethods.create.mockResolvedValue({ identifiers: [1] });
      ModelMockMethods.patch.mockResolvedValue({ affected: 1 });
      ModelMockMethods.update.mockResolvedValue({ affected: 1 });
      ModelMockMethods.remove.mockResolvedValue({ affected: 1 });
    });

    test.todo('Should define controller config property');

    test('Should disable multi methods', async () => {
      // act
      await bootstrap(server, {
        controllers: [EntityControllerTest],
        defaults: { allowMulti: false }
      });

      // assert
      const getResponse = await server.inject({ method: 'GET', url: '/entity/' });
      expect(getResponse.statusCode).toBe(405);
      expect(getResponse.statusMessage).toBe('Method Not Allowed');
      expect(JSON.parse(getResponse.body).message).toBe('Method GET is not allowed here');

      const patchResponse = await server.inject({ method: 'PATCH', url: '/entity/' });
      expect(patchResponse.statusCode).toBe(405);
      expect(patchResponse.statusMessage).toBe('Method Not Allowed');
      expect(JSON.parse(patchResponse.body).message).toBe('Method PATCH is not allowed here');

      const updateResponse = await server.inject({ method: 'PUT', url: '/entity/' });
      expect(updateResponse.statusCode).toBe(405);
      expect(updateResponse.statusMessage).toBe('Method Not Allowed');
      expect(JSON.parse(updateResponse.body).message).toBe('Method PUT is not allowed here');

      const removeResponse = await server.inject({ method: 'DELETE', url: '/entity/' });
      expect(removeResponse.statusCode).toBe(405);
      expect(removeResponse.statusMessage).toBe('Method Not Allowed');
      expect(JSON.parse(removeResponse.body).message).toBe('Method DELETE is not allowed here');

      const getOneResponse = await server.inject({ method: 'GET', url: '/entity/1' });
      expect(getOneResponse.statusCode).toBe(200);
      expect(getOneResponse.statusMessage).toBe('OK');

      const patchOneResponse = await server.inject({ method: 'PATCH', url: 'entity/1', body: {} } as any);
      expect(patchOneResponse.statusCode).toBe(200);
      expect(getOneResponse.statusMessage).toBe('OK');

      const createResponse = await server.inject({ method: 'POST', url: 'entity', body: { name: 'NEW' } } as any);
      expect(createResponse.statusCode).toBe(200);
      expect(createResponse.statusMessage).toBe('OK');

      const updateOneResponse = await server.inject({ method: 'PUT', url: 'entity/1', body: { name: 'UPDATED' } } as any);
      expect(updateOneResponse.statusCode).toBe(200);
      expect(updateOneResponse.statusMessage).toBe('OK');

      const deleteOneResponse = await server.inject({ method: 'DELETE', url: 'entity/1' });
      expect(deleteOneResponse.statusCode).toBe(200);
      expect(deleteOneResponse.statusMessage).toBe('OK');
    });

    test('Should disable not allowed methods', async () => {
      // arrange
      const restricted = [
        { method: 'GET', url: '/entity/1' },
        { method: 'PATCH', url: '/entity/', body: {} },
        { method: 'PATCH', url: '/entity/1', body: {} },
        { method: 'PUT', url: '/entity/', body: {} },
        { method: 'PUT', url: '/entity/1', body: {} },
        { method: 'DELETE', url: '/entity/' },
      ];

      const allowed = [
        { method: 'GET', url: '/entity/' },
        { method: 'POST', url: '/entity/', body: { name: 'FASTIFY-RESTY-TESTING' } },
        { method: 'DELETE', url: '/entity/1' }
      ];

      // act
      await bootstrap(server, {
        controllers: [EntityControllerTest],
        defaults: { methods: ['find', 'create', 'removeOne'] }
      });

      const restrictedResponses = await Promise.all(
        restricted.map(opts => server.inject({ method: opts.method as any, url: opts.url, body: opts.body } as any))
      );

      const allowedResponses = await Promise.all(
        allowed.map(opts => server.inject({ method: opts.method as any, url: opts.url, body: opts.body } as any))
      );

      // assert
      restrictedResponses.forEach(response => {
        expect(response).toHaveProperty('statusCode', 405);
        expect(response).toHaveProperty('statusMessage', 'Method Not Allowed');
      });

      allowedResponses.forEach(response => {
        expect(response).toHaveProperty('statusCode', 200);
        expect(response).toHaveProperty('statusMessage', 'OK');
      });
    });

    test('Should use custom primary id name', async () => {
      // act
      await bootstrap(server, {
        controllers: [EntityControllerTest],
        defaults: { id: '_id' }
      });

      await server.inject({ method: 'GET', url: '/entity/29' });
      await server.inject({ method: 'DELETE', url: '/entity/3102' });
      await server.inject({ method: 'PATCH', url: '/entity/189', body: {} } as any);

      // arrange
      expect(ModelMockMethods.find).toBeCalledWith({ $where: { _id: '29' }});
      expect(ModelMockMethods.remove).toBeCalledWith({ _id: '3102' });
      expect(ModelMockMethods.patch).toBeCalledWith({ _id: '189' }, {});
    });

    describe('Pagination configuration', () => {

      test.todo('Should use default pagination');

      test.todo('Should disable pagination from the configuration');

    });

  });

});
 