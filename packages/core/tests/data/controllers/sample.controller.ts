import { Controller, GET, OnRequest } from '../../../src';

@Controller('/sample')
export default class SampleController {
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

  @OnRequest
  async onRequestHook(): Promise<void> {
    return;
  }
}
