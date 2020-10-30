import { EntityController, GET, PreHandler } from '../../../src';

@EntityController({}, '/entity-sample')
export default class EntitySampleController {
  @GET('/custom', {
    schema: {
      querystring: {
        flag: { type: 'boolean' }
      }
    }
  })
  async getCustom() {
    return { status: 'complete' };
  }

  @PreHandler
  async preHandlerHook(): Promise<void> {
    return;
  }
}
