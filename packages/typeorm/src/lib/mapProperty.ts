import type { EntityMetadata } from 'typeorm';
import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema';

const cleanup = <T>(obj: T): Partial<T> => Object.keys(obj)
  .reduce((acc, key) => {
    if (obj[key]) acc[key] = obj[key];
    return acc;
  }, {});

type ColumnMetadata = EntityMetadata['columns'][0];

const mapPropertyType = (type: any): JSONSchema7TypeName => {
  if (typeof type === 'function') {
    if (type === Number) return 'number';
    if (type === String) return 'string';
    if (type === Boolean) return 'boolean';
  }
  return typeof type as any;
};

export default (columnMetadata: ColumnMetadata): JSONSchema7 => {
  const { length, comment, propertyName, isNullable, isSelect, isUpdate, isGenerated } = columnMetadata;

  const schemaProperty: JSONSchema7 = cleanup({
    type: mapPropertyType(columnMetadata.type),
    title: propertyName,
    description: comment,
    maxLength: length !== undefined ? parseInt(length, 10) : undefined,
    default: (typeof columnMetadata.default !== 'function') ? columnMetadata.default : undefined,
    enum: columnMetadata.enum,
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
