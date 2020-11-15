import * as core from '../../src';

describe('Core package index exported', () => {

  it('Should export core decorators', () => {
    expect(core.Controller).toBeDefined();
    expect(core.EntityController).toBeDefined();
    expect(core.Service).toBeDefined();
    expect(core.Model).toBeDefined();
  })

  it('Should export request method decorators', () => {
    expect(core.GET).toBeDefined();
    expect(core.HEAD).toBeDefined();
    expect(core.PATCH).toBeDefined();
    expect(core.POST).toBeDefined();
    expect(core.PUT).toBeDefined();
    expect(core.OPTIONS).toBeDefined();
    expect(core.DELETE).toBeDefined();
    expect(core.ALL).toBeDefined();
  });

  it('Should export hooks decorators', () => {
    expect(core.OnRequest).toBeDefined();
    expect(core.PreParsing).toBeDefined();
    expect(core.PreValidation).toBeDefined();
    expect(core.PreHandler).toBeDefined();
    expect(core.PreSerialization).toBeDefined();
    expect(core.OnError).toBeDefined();
    expect(core.OnSend).toBeDefined();
    expect(core.OnResponse).toBeDefined();
    expect(core.OnTimeout).toBeDefined();
  });

  it('Should export global symbols', () => {
    expect(core.FastifyToken).toBeDefined();
    expect(core.GlobalConfig).toBeDefined();
  });

  it('Should export DI decorators', () => {
    expect(core.Inject).toBeDefined();
  });

});
