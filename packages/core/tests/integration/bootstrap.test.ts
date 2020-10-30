import path from 'path';
import { bootstrap } from '../../src/bootstrap';
import fastify, { FastifyInstance } from 'fastify';
import ModelMock, * as ModelMockMethods from '../support/ModelMock';
import SampleController from '../data/controllers/sample.controller';
import EntitySampleController from '../data/controllers/entitySample.controller';

describe('Bootstrap', () => {
  const spies: Record<string, jest.SpyInstance> = {};
  let server: FastifyInstance;

  beforeAll(() => {
    spies.sample_getCustom = jest.spyOn(SampleController.prototype, 'getCustom');
    spies.sample_onRequestHook = jest.spyOn(SampleController.prototype, 'onRequestHook');
    spies.entitySample_getCustom = jest.spyOn(EntitySampleController.prototype, 'getCustom');
    spies.entitySample_preHandlerHook = jest.spyOn(EntitySampleController.prototype, 'preHandlerHook');
    // TODO entity sample find method
  });

  beforeEach(() => { server = fastify(); });

  afterEach(() => {
    Object.values(spies).forEach(spy => spy.mockClear());
    ModelMock.mockClear();
    server.close();
  });

  test('Should apply nested query string parser', async () => {
    await bootstrap(server, {});

    server.get('/', async ({ query }: any) => !!(query.$where?.title && query.$where?.age?.$gte));

    const response = await server.inject({
      method: 'GET',
      url: '/?$where[title]=Hello&$where[id][$lt]=10&$where[age][$gte]=18'
    });

    expect(response.body).toBe('true');
  });

  test('Should decorate configuration object as "fastify-resty-config"', async () => {
    bootstrap(server, {});
    expect(server['fastify-resty-config']).toBeDefined();
  });

  test('Should use default configuration', async () => {
    await bootstrap(server, {});
    const config = server['fastify-resty-config'];

    expect(config.entry).toBeUndefined();
    expect(config.pattern.test('mycontroller.controller.ts')).toBeTruthy();
    expect(config.defaults).toMatchObject({
      pagination: { limit: 20, total: true },
      id: 'id',
      softDelete: false,
      methods: undefined,
      allowMulti: true,
      returning: true
    });

  });

  test('Should merge custom and default configuration', async () => {
    await bootstrap(server, {
      defaults: {
        pagination: false,
        allowMulti: false,
        softDelete: true
      }
    });

    expect(server['fastify-resty-config'].defaults).toMatchObject({
      pagination: false,
      id: 'id',
      softDelete: true,
      methods: undefined,
      allowMulti: false,
      returning: true
    });
  });

  test('Should register controllers by direct array', async () => {
    ModelMockMethods.find.mockResolvedValue([{ name: 'Sample' }]);
    ModelMockMethods.total.mockResolvedValue(1);

    server.decorate('Model', ModelMock);
    await bootstrap(server, { controllers: [SampleController, EntitySampleController] });

    const responseSample = await server.inject({ method: 'GET', url: '/sample/custom?flag=true' });
    expect(responseSample).toHaveProperty('statusCode', 200);
    expect(responseSample).toHaveProperty('statusMessage', 'OK');
    expect(responseSample).toHaveProperty('body', '{"status":"complete"}');
    expect(spies.sample_getCustom).toHaveBeenCalledTimes(1);
    expect(spies.sample_onRequestHook).toHaveBeenCalledTimes(1);

    const responseEntity = await server.inject({ method: 'GET', url: '/entity-sample/' });
    expect(JSON.parse(responseEntity.body)).toMatchObject({ total: 1, limit: 20, skip: 0, data: [{ name: 'Sample' }]});
    expect(responseEntity).toHaveProperty('statusCode', 200);
    expect(responseEntity).toHaveProperty('statusMessage', 'OK');
    expect(spies.entitySample_preHandlerHook).toHaveBeenCalledTimes(1);

    const responseEntityCustom = await server.inject({ method: 'GET', url: '/entity-sample/custom' });
    expect(responseEntityCustom).toHaveProperty('statusCode', 200);
    expect(responseEntityCustom).toHaveProperty('statusMessage', 'OK');
    expect(responseEntityCustom).toHaveProperty('body', '{"status":"complete"}');
    expect(spies.entitySample_getCustom).toHaveBeenCalledTimes(1);
    expect(spies.entitySample_preHandlerHook).toHaveBeenCalledTimes(2);
  });

  test('Should register controllers with autoload', async () => {
    ModelMockMethods.find.mockResolvedValue([{ name: 'Sample' }]);
    ModelMockMethods.total.mockResolvedValue(1);

    server.decorate('Model', ModelMock);
    await bootstrap(server, { entry: path.join(__dirname, '../data/controllers') });

    const responseSample = await server.inject({ method: 'GET', url: '/sample/custom?flag=true' });
    expect(responseSample).toHaveProperty('statusCode', 200);
    expect(responseSample).toHaveProperty('statusMessage', 'OK');
    expect(responseSample).toHaveProperty('body', '{"status":"complete"}');
    expect(spies.sample_getCustom).toHaveBeenCalledTimes(1);
    expect(spies.sample_onRequestHook).toHaveBeenCalledTimes(1);

    const responseEntity = await server.inject({ method: 'GET', url: '/entity-sample/' });
    expect(JSON.parse(responseEntity.body)).toMatchObject({ total: 1, limit: 20, skip: 0, data: [{ name: 'Sample' }]});
    expect(responseEntity).toHaveProperty('statusCode', 200);
    expect(responseEntity).toHaveProperty('statusMessage', 'OK');
    expect(spies.entitySample_preHandlerHook).toHaveBeenCalledTimes(1);

    const responseEntityCustom = await server.inject({ method: 'GET', url: '/entity-sample/custom' });
    expect(responseEntityCustom).toHaveProperty('statusCode', 200);
    expect(responseEntityCustom).toHaveProperty('statusMessage', 'OK');
    expect(responseEntityCustom).toHaveProperty('body', '{"status":"complete"}');
    expect(spies.entitySample_getCustom).toHaveBeenCalledTimes(1);
    expect(spies.entitySample_preHandlerHook).toHaveBeenCalledTimes(2);
  });

});
