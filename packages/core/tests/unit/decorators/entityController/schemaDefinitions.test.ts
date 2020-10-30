import { JSONSchema7 } from 'json-schema';
import { schemaDefinitions } from '../../../../src/decorators/entityController/schemaBuilder/schemaDefinitions';
import definitionsData from '../../../data/schemaDefinitions.json';

describe('schemaDefinitions', () => {

  test('Should be defined', () => {
    expect(schemaDefinitions).toBeDefined();
    expect(typeof schemaDefinitions).toBe('function');
  });

  test('Should generate json schema definitions', () => {
    const schemaProperties: Record<string, JSONSchema7> = {
      id: { type: 'number' },
      string: { type: 'string' },
      boolean: { type: 'boolean', default: false }
    };

    const definitions = schemaDefinitions(schemaProperties);
    expect(definitions).toMatchObject(definitionsData);
  });

});
