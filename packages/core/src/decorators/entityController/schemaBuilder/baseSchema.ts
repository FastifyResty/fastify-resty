import type { JSONSchema7 } from 'json-schema';
import type { IControllerSchemas, JSONSchema7Extended } from '../../../types';

const sortingEnum = ['ASC', 'DESC', 'asc', 'desc'];

const partialSchemaProperties = (schemaId: string, schema: Record<string, JSONSchema7Extended>) =>
  Object.keys(schema)
    .filter(key => !schema[key]._options?.hidden && !schema[key].readOnly)
    .reduce((props, key) => ({
      ...props,
      [key]: { $ref: `${schemaId}#/definitions/entity/properties/${key}` }
    }), {});

const mergeRef = ($ref: string, properties): JSONSchema7 => ({
  type: 'object',
  allOf: [{ $ref }, { properties }]
});

const multiAffectedResponse = ($ref: string): JSONSchema7 => ({
  type: 'object',
  properties: {
    affected: { type: 'number' },
    data: {
      type: 'array',
      items: { $ref }
    }
  }
});

const singleAffectedResponse = ($ref: string): JSONSchema7 => {
  const properties: Record<string, JSONSchema7> = { affected: { type: 'number' } };
  return {
    type: 'object',
    properties,
    if: { not: { properties } },
    then: { $ref }
  };
};

export const baseSchema = (schemaId: string, schema: Record<string, JSONSchema7Extended>): IControllerSchemas => ({
  find: {
    querystring: {
      $select: {
        type: ['string', 'array'],
        items: {
          type: 'string'
        }
      },
      $sort: {
        type: ['string', 'array', 'object'],
        enum: sortingEnum,
        items: {
          type: 'string'
        },
        properties: Object.keys(schema)
          .filter(key => !schema[key].writeOnly && !schema[key]._options?.hidden)
          .reduce((acc, key) => ({
            ...acc, [key]: { type: 'string', enum: sortingEnum }
          }), {})
      },
      $limit: { type: 'number' },
      $skip:  { type: 'number' },
      $where: { $ref: `${schemaId}#/definitions/query` }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          total: { type: 'number' },
          limit: { type: 'number' },
          skip:  { type: 'number' },
          data: {
            type: 'array',
            items: {
              $ref: `${schemaId}#/definitions/entity`
            }
          }
        }
      }
    }
  },
  findOne: {
    params: {
      id: { type: ['number', 'string'] }
    },
    querystring: {
      $results: { type: 'boolean' }
    },
    response: {
      200: { $ref: `${schemaId}#/definitions/entity` }
    }
  },
  create: {
    querystring: {
      $results: { type: 'boolean' }
    },
    body: {
      type: ['array', 'object'],
      items: { $ref: `${schemaId}#/definitions/entity` },

      if:   { type: 'object' },
      then: { $ref: `${schemaId}#/definitions/entity` }
    },
    response: {
      // Not possible to support a few types. The issue: https://github.com/fastify/fast-json-stringify/issues/193
      200: {
        type: 'array',
        items: {
          type: ['number', 'object'],
          if:   { type: 'object' },
          then: { $ref: `${schemaId}#/definitions/entity` }
        }
      }
    }
  },
  patch: {
    querystring: mergeRef(`${schemaId}#/definitions/query`, { $results: { type: 'boolean' } }),
    body: {
      type: 'object',
      properties: partialSchemaProperties(schemaId, schema)
    },
    response: {
      200: multiAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  },
  patchOne: {
    params: {
      id: { type: ['number', 'string'] }
    },
    querystring: {
      $results: { type: 'boolean' }
    },
    body: {
      type: 'object',
      properties: partialSchemaProperties(schemaId, schema)
    },
    response: {
      200: singleAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  },
  update: {
    querystring: mergeRef(`${schemaId}#/definitions/query`, { $results: { type: 'boolean' } }),
    body: {
      $ref: `${schemaId}#/definitions/entity`
    },
    response: {
      200: multiAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  },
  updateOne: {
    params: {
      id: { type: ['number', 'string'] }
    },
    querystring: {
      $results: { type: 'boolean' }
    },
    body: {
      $ref: `${schemaId}#/definitions/entity`
    },
    response: {
      200: singleAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  },
  remove: {
    querystring: mergeRef(`${schemaId}#/definitions/query`, { $results: { type: 'boolean' } }),
    response: {
      200: multiAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  },
  removeOne: {
    params: {
      id: { type: ['number', 'string'] }
    },
    querystring: {
      $results: { type: 'boolean' }
    },
    response: {
      200: singleAffectedResponse(`${schemaId}#/definitions/entity`)
    }
  }
});
