import { bootstrap } from '../../src/bootstrap';
import { BaseModel } from '../../src/BaseModel';

describe('bootstrap', () => {

  test('Should decorate instance', () => {
    // arrange
    const fastifyInstance = { decorate: jest.fn() };
    const connection = jest.fn();
    const callback = jest.fn();

    // act
    bootstrap(fastifyInstance, { connection }, callback);

    // assert
    expect(bootstrap).toBeDefined();

    expect(fastifyInstance.decorate).toHaveBeenCalledTimes(2);
    expect(fastifyInstance.decorate).toHaveBeenCalledWith('connection', connection);
    expect(fastifyInstance.decorate).toHaveBeenCalledWith('BaseModel', BaseModel);

    expect(BaseModel.connection).toBe(connection);
    expect(callback).toBeCalledTimes(1);
  });

});