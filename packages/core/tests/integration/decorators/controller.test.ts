import { bootstrap } from '../../../src/bootstrap';
import fastify, { FastifyInstance } from 'fastify';

import { controllerFactory } from '../../support/controllerFactory';
import methodsDefinitions from '../../data/controllerMethodsDefinitions';


describe('@Controller decorator', () => {
  let server: FastifyInstance;

  beforeEach(async () => { server = fastify(); });

  afterEach(() => { server.close(); });

  describe('Controller register', () => {

    test('Should register controller on specific route', async () => {
      // arrange
      const TestController = controllerFactory('/example', [{ route: '/', method: 'GET', handler: () => [] }]);
      await bootstrap(server, { controllers: [TestController] });

      // act
      await server.listen(4000);

      // assert
      expect(server.printRoutes()).toMatch(/^└── \/\n\s{4}└── example \(GET\)\n\s{8}└── \/ \(GET\)\n$/);
    });

    test('Should register controller without "route" option', async () => {
      // arrange
      const TestController = controllerFactory(undefined, [{ route: '/my-route', method: 'GET', handler: () => [] }]);
      await bootstrap(server, { controllers: [TestController] });

      // act
      await server.listen(4000);

      // assert
      expect(server.printRoutes()).toMatch(/^└── \/\n\s{4}└── my-route \(GET\)\n$/);
    });

  });

  describe('Controller hooks', () => {
  
    test('Should handle @OnRequest hook', async () => {
      // arrange
      const hookHandler = jest.fn((request, reply, done) => done());
      const routeHandler = jest.fn().mockResolvedValue([]);

      const TestController = controllerFactory(
        '/hooks-on-request',
        [{ route: '/', method: 'GET', handler: routeHandler }],
        [{ hook: 'OnRequest', handler: hookHandler }]
      );
      await bootstrap(server, { controllers: [TestController] });

      // act
      const response = await server.inject({ method: 'GET', url: '/hooks-on-request/' });

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.statusMessage).toBe('OK');

      expect(hookHandler).toBeCalledTimes(1);
    });

    test('Should handle @PreParsing hook', async () => {
      // arrange
      const hookHandler = jest.fn((request, reply, payload, done) => done(null, payload));
      const routeHandler = jest.fn().mockResolvedValue([]);

      const TestController = controllerFactory(
        '/hooks-pre-parsing',
        [{ route: '/', method: 'POST', handler: routeHandler }],
        [{ hook: 'PreParsing', handler: hookHandler }]
      );
      await bootstrap(server, { controllers: [TestController] });

      // act
      const response = await server.inject({ method: 'POST', url: '/hooks-pre-parsing/', body: { title: 'Testing' } } as any);

      // assert
      expect(response.statusCode).toBe(200);
      expect(response.statusMessage).toBe('OK');

      expect(hookHandler).toBeCalledTimes(1);
    });

    test('Should handle @PreValidation hook', async () => {
       // arrange
       const hookHandler = jest.fn((request, reply, done) => done());
       const routeHandler = jest.fn().mockResolvedValue([]);
 
       const TestController = controllerFactory(
         '/hooks-pre-validation',
         [{ route: '/', method: 'GET', handler: routeHandler }],
         [{ hook: 'PreValidation', handler: hookHandler }]
       );
       await bootstrap(server, { controllers: [TestController] });
 
       // act
       const response = await server.inject({ method: 'GET', url: '/hooks-pre-validation/' });
 
       // assert
       expect(response.statusCode).toBe(200);
       expect(response.statusMessage).toBe('OK');
 
       expect(hookHandler).toBeCalledTimes(1);
    });

    // TODO: add 'preHandler', 'preSerialization', 'onError', 'onSend', 'onResponse', 'onTimeout';
    // with the next pattern:
    //
    // test('Should handle @PreValidation hook', async () => {});
  
  });

  describe('Request decorators', () => {

    describe('@GET', () => {

      test('Should register @GET endpoint', async () => {
        // arrange
        const { response } = methodsDefinitions.get;
        const handler = jest.fn().mockResolvedValue(response);

        const TestController = controllerFactory('/test-get', [{ route: '/:id', method: 'GET', handler }]);
        await bootstrap(server, { controllers: [TestController] });

        // act
        const result = await server.inject({ method: 'GET', url: '/test-get/965?$limit=20&$results=true' });

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(result.body).toBe(JSON.stringify(response));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0].length).toBe(2);
        expect(handler.mock.calls[0][0].params.id).toBe('965');
        expect(handler.mock.calls[0][0].query.$limit).toBe('20');
        expect(handler.mock.calls[0][0].query.$results).toBe('true');
      });

      test('Should register @GET endpoint with schema and hooks', async () => {
        // arrange
        const { response, schema } = methodsDefinitions.get;
  
        const handler = jest.fn().mockResolvedValue(response);
        const preValidation = jest.fn().mockImplementation((request, reply, done) => done());
  
        const TestController = controllerFactory('/test-get', [{ route: '/:id', method: 'GET', handler, options: { schema, preValidation } }]);
        await bootstrap(server, { controllers: [TestController] });
  
        // act
        const result = await server.inject({ method: 'GET', url: '/test-get/965?$limit=20&$results=true' });
  
        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(result.body).toBe(JSON.stringify({ data: response.data, total: response.total }));
  
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0].length).toBe(2);
        expect(handler.mock.calls[0][0].params.id).toBe(965);
        expect(handler.mock.calls[0][0].query.$limit).toBe(20);
        expect(handler.mock.calls[0][0].query.$results).toBe(true);
  
        expect(preValidation).toBeCalledTimes(1);
      });

    });

    describe('@POST', () => {

      test('Should register @POST endpoint', async () => {
         // arrange
         const { response, body } = methodsDefinitions.post;
         const handler = jest.fn().mockResolvedValue(response);

         const TestController = controllerFactory('/test-post', [{ route: '/', method: 'POST', handler }]);
         await bootstrap(server, { controllers: [TestController] });
 
         // act
         const result = await server.inject({ method: 'POST', url: '/test-post/?$results=true', body } as any);
 
         // assert
         expect(result.statusCode).toBe(200);
         expect(result.statusMessage).toBe('OK');
         expect(result.body).toBe(JSON.stringify(response));
 
         expect(handler).toHaveBeenCalledTimes(1);
         expect(handler.mock.calls[0].length).toBe(2);
         expect(handler.mock.calls[0][0].query.$results).toBe('true');
         expect(handler.mock.calls[0][0].body).toMatchObject(body);
      });

      test('Should register @POST endpoint with schema and hooks', async () => {
        // arrange
        const { response, body, schema } = methodsDefinitions.post;

        const handler = jest.fn().mockResolvedValue(response);
        const preParsing = jest.fn().mockImplementation((request, reply, payload, done) => done(null, payload));

        const TestController = controllerFactory('/test-post', [{ route: '/', method: 'POST', handler, options: { schema, preParsing } }]);
        await bootstrap(server, { controllers: [TestController] });

        // act
        const result = await server.inject({ method: 'POST', url: '/test-post/?$results=true', body } as any);

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(result.body).toBe(JSON.stringify({ createdAt: response.createdAt }));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0].length).toBe(2);
        expect(handler.mock.calls[0][0].query.$results).toBe(true);
        expect(handler.mock.calls[0][0].body).toMatchObject(body);

        expect(preParsing).toBeCalledTimes(1);
      });

    });

    describe('@PATCH', () => {

      test('Should register @PATCH endpoint', async () => {
        // arrange
        const { response, body } = methodsDefinitions.patch;
        const handler = jest.fn().mockResolvedValue(response);

        const TestController = controllerFactory('/test-patch', [{ route: '/:ref', method: 'PATCH', handler }]);
        await bootstrap(server, { controllers: [TestController] });

        // act
        const result = await server.inject({ method: 'PATCH', url: '/test-patch/sample?times=9', body } as any);

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(result.body).toBe(JSON.stringify(response));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0].length).toBe(2);
        expect(handler.mock.calls[0][0].params.ref).toBe('sample');
        expect(handler.mock.calls[0][0].query.times).toBe('9');
        expect(handler.mock.calls[0][0].body).toMatchObject(body);
      });

      test('Should register @PATCH endpoint with schema and hooks', async () => {
        // arrange
        const { response, body, schema } = methodsDefinitions.patch;

        const handler = jest.fn().mockResolvedValue(response);
        const preHandler = jest.fn().mockImplementation((request, reply, done) => done());

        const TestController = controllerFactory('/test-patch', [{ route: '/:ref', method: 'PATCH', handler, options: { schema, preHandler } }]);
        await bootstrap(server, { controllers: [TestController] });

        // act
        const result = await server.inject({ method: 'PATCH', url: '/test-patch/sample?times=9', body } as any);

        // assert
        expect(result.statusCode).toBe(200);
        expect(result.statusMessage).toBe('OK');
        expect(result.body).toBe(JSON.stringify(response));

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0].length).toBe(2);
        expect(handler.mock.calls[0][0].params.ref).toBe('sample');
        expect(handler.mock.calls[0][0].query.times).toBe(9);
        expect(handler.mock.calls[0][0].body).toMatchObject(body);

        expect(preHandler).toHaveBeenCalledTimes(1);
      });

    });

    // TODO: add UPDATE, DELETE, HEAD, PUT, OPTIONS, ALL (all + custom methods)
    // with the next pattern:
    //
    // describe('@POST', () => {
    //   test('Should register @POST endpoint', async () => {});
    //   test('Should register @POST endpoint with schema and hooks', async () => {});
    // });

  });
  
});
