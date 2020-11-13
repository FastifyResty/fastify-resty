import fs from 'fs';
import path from 'path';
import qs from 'qs';
import Injector from './injector';
import { FastifyToken, GlobalConfig, Initialize } from './symbols';
import { createAppConfig } from './configurations';
import type { FastifyInstance } from 'fastify';
import type { Constructable, IApplicationOptions } from './types';

interface IBootstrapResult {
  controllers: any[]; // TODO specify controllers type
}

export async function bootstrap(fastifyInstance: FastifyInstance, options: IApplicationOptions): Promise<IBootstrapResult> {
  const config = createAppConfig(options);
  const controllers = new Set<Constructable>();

  const injector = new Injector();
  injector.registerInstance(FastifyToken, fastifyInstance);

  // decorate global config
  fastifyInstance.decorate(GlobalConfig, config);

  // add custom query parser for each request (qs)
  fastifyInstance.addHook('onRequest', async request => {
    request.query = qs.parse(request.raw.url.replace(/\?{2,}/, '?').split('?')[1] || '');
  });

  // controllers autoload
  if (config.entry) {
    function loadDirectory(directoryPath) {
      const files = fs.readdirSync(directoryPath);
      files.forEach(file => {
        const filePath = path.resolve(directoryPath, file);

        if (fs.lstatSync(filePath).isDirectory()) {
          return loadDirectory(path.resolve(directoryPath, file));
        }
        
        if (config.pattern.test(filePath)) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          controllers.add(require(filePath).default);
        }
      });
    }

    loadDirectory(config.entry);
  }

  // add manual registered controllers
  if (config.controllers) {
    config.controllers.forEach(controller => controllers.add(controller));
  }

  // initialize controllers
  const controllersInstances = Array.from(controllers)
    .filter(controller => controller?.prototype && Reflect.hasMetadata('fastify-resty:controller', controller.prototype))
    .map(async controller => {
      let controllerInstance;
      const controllerMetadata = Reflect.getMetadata('fastify-resty:controller', controller.prototype);

      await fastifyInstance.register(async instance => {
        // resolve controller instance using DI
        controllerInstance = injector.getInstance(controller);

        // initialize built-in configuration
        if (typeof controllerInstance[Initialize] === 'function') {
          controllerInstance[Initialize](instance, config.defaults);
        }

        // add schema definitions to global scope
        if (Reflect.hasMetadata('fastify-resty:definitions', controllerInstance)) {
          const schemaDefinitions = Reflect.getMetadata('fastify-resty:definitions', controllerInstance);
          fastifyInstance.addSchema({ $id: `/${controllerInstance.model.name}.json`, ...schemaDefinitions });
        }

        // register controller handlers
        const handlersKeys: Set<string> = Reflect.getMetadata('fastify-resty:handlers', controller.prototype);
        if (handlersKeys) {
          handlersKeys.forEach(handlerKey => {
            const handlerOptions = Reflect.getMetadata('fastify-resty:handler', controller.prototype, handlerKey);
            instance.route({ ...handlerOptions, handler: controller.prototype[handlerKey].bind(controllerInstance) });
          });
        }

        // register controller hooks
        const hookKeys: Set<string> = Reflect.getMetadata('fastify-resty:hooks', controller.prototype);
        if (hookKeys) {
          hookKeys.forEach(hookKey => {
            const hookOptions = Reflect.getMetadata('fastify-resty:hook', controller.prototype, hookKey);
            instance.addHook(hookOptions.event, controller.prototype[hookKey].bind(controllerInstance));
          });
        }

      }, { prefix: controllerMetadata?.route || '/' });

      return controllerInstance;
    });

  return {
    controllers: await Promise.all(controllersInstances)
  };
}

bootstrap[Symbol.for('skip-override')] = true;
