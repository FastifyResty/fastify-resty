import type { EntityMetadata } from 'typeorm';
import type { JSONSchema7 } from 'json-schema';

const cleanup = <T>(obj: T): Partial<T> => Object.keys(obj)
  .reduce((acc, key) => {
    if (obj[key]) acc[key] = obj[key];
    return acc;
  }, {});

type ColumnMetadata = EntityMetadata['columns'][0];

const mapPropertyType = (type: any, enumValue: ColumnMetadata['enum']): Pick<JSONSchema7, 'type' | 'enum' | 'items'> => {
  if (typeof type === 'function') {
    if (type === Number) return { type: 'number', enum: enumValue };
    if (type === String) return { type: 'string', enum: enumValue };
    if (type === Boolean) return { type: 'boolean', enum: enumValue };
  }
  if (type === 'set') return { type: 'array', items: { enum: enumValue } };

  return { type: typeof type as any, enum: enumValue };
};

export default (columnMetadata: ColumnMetadata): JSONSchema7 => {
  const { length, comment, propertyName, isNullable, isSelect, isUpdate, isGenerated } = columnMetadata;

  const schemaProperty: JSONSchema7 = cleanup({
    ...mapPropertyType(columnMetadata.type, columnMetadata.enum),
    title: propertyName,
    description: comment,
    maxLength: length !== undefined ? parseInt(length, 10) : undefined,
    default: (typeof columnMetadata.default !== 'function') ? columnMetadata.default : undefined,
    readOnly: isSelect && !isUpdate,
    writeOnly: !isSelect && isUpdate,
    format: ['timestamp', 'date'].includes(columnMetadata.type as string) && 'date-time',

    // custom schema options
    _options: {
      generated: typeof columnMetadata.default === 'function' || isGenerated,
      nullable: isNullable,
      hidden: !isSelect
    }
  });

  return schemaProperty;
}
