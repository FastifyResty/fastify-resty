import type { Connection } from 'typeorm';
import { Model } from '../../src/Model';

class Entity {}

describe('Model', () => {
  const model = new Model(Entity);
  const mocks: Record<string, jest.Mock> = {};

  beforeAll(() => {
    mocks.getMetadataMock = jest.fn().mockReturnValue({
      columns: [
        { propertyName: 'id', type: Number },
        { propertyName: 'name', type: String },
        { propertyName: 'age', type: Number }
      ]
    });
  });

  afterEach(() => {
    Object.values(mocks).forEach(mock => mock.mockClear());
  });

  test('Should have model base methods', () => {
    expect(model.find).toBeTruthy();
    expect(model.create).toBeTruthy();
    expect(model.patch).toBeTruthy();
    expect(model.update).toBeTruthy();
    expect(model.remove).toBeTruthy();
    expect(model.total).toBeTruthy();
  });

  test('Should return model name', () => {
    expect(model.name).toBe('Entity');
  });

  test('Should return model name and jsonSchema', () => {
    Model.connection = { getMetadata: mocks.getMetadataMock } as unknown as Connection;
    
    expect(model.jsonSchema).toBeDefined();
    expect(mocks.getMetadataMock).toHaveBeenCalled();
    expect(mocks.getMetadataMock).toHaveBeenCalledWith(Entity);
  });
});
