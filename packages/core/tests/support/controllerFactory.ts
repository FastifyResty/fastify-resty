import { Controller } from '../../src/decorators/controller';
import * as METHODS from '../../src/decorators/requestMethods';
import * as HOOKS from '../../src/decorators/hooks';

import type { RouteShorthandOptions } from 'fastify';

export const controllerFactory = (
  controllerRoute: string,
  methods: {
    method: keyof typeof METHODS,
    route: string,
    handler: (...args: any[]) => any,
    options?: RouteShorthandOptions
  }[] = [],
  hooks: {
    hook: keyof typeof HOOKS,
    handler: (...args: any[]) => any
  }[] = []
) => {
  @Controller(controllerRoute)
  class TestController {}

  methods.forEach((methodConfig, index) => {
    TestController.prototype[`${methodConfig.method}_${index}`] = methodConfig.handler;
    METHODS[methodConfig.method]
      (methodConfig.route, methodConfig.options as any || {})
      (TestController.prototype, `${methodConfig.method}_${index}`);
  });

  hooks.forEach((hookConfig, index) => {
    TestController.prototype[`${hookConfig.hook}_${index}`] = hookConfig.handler;
    HOOKS[hookConfig.hook](TestController.prototype, `${hookConfig.hook}_${index}`);
  });

  return TestController;
}
