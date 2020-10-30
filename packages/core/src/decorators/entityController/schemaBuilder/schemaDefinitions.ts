import type { JSONSchema7 } from 'json-schema';
import type { JSONSchema7Extended } from '../../../types';

const queryProperties = (type: 'number' | 'string' | ['number', 'string']): Record<string, JSONSchema7> => ({
  $eq:       { type },
  $neq:      { type },
  $gt:       { type },
  $gte:      { type },
  $lt:       { type },
  $lte:      { type },
  $like:     { type: 'string' },
  $nlike:    { type: 'string' },
  $ilike:    { type: 'string' },
  $nilike:   { type: 'string' },
  $regex:    { type: 'string' },
  $nregex:   { type: 'string' },
  $in:       { type: 'array', items: { type } },
  $nin:      { type: 'array', items: { type } },
  $between:  { type: 'array', items: [{ type }, { type }] },
  $nbetween: { type: 'array', items: [{ type }, { type }] }
});

const isRequired = (property: JSONSchema7Extended) => !property.default && !property._options?.generated && !property._options?.nullable;

export const schemaDefinitions = (schemaProperties: Record<string, JSONSchema7Extended>): JSONSchema7 => ({
  definitions: {
    entity: {
      type: 'object',
      properties: Object.keys(schemaProperties)
        .filter(key => !schemaProperties[key]._options?.hidden)
        .reduce((props, key) => ({ ...props, [key]: schemaProperties[key] }), {}),
      required: Object.keys(schemaProperties)
        .reduce((required, key) => [...required, ...(isRequired(schemaProperties[key]) ? [key] : [])], [])
    },
    query: {
      type: 'object',
      properties: Object.keys(schemaProperties)
        .filter(key => !schemaProperties[key].writeOnly && !schemaProperties[key]._options?.hidden)
        .reduce((acc, key) => ({
          ...acc,
          [key]: {
            type: ['string', 'number', 'object'],
            properties: queryProperties(
              ['string', 'number'].includes(schemaProperties[key].type.toString())
                ? schemaProperties[key].type as 'string' | 'number'
                : ['number', 'string']
            )
          }
        }), {
          $or: {
            type: 'array',
            items: {
              $ref: '#/definitions/query'
            }
          }
        })
    }
  }
});
