import fs from 'fs';
import { Column, Connection, createConnection, Entity, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
import mapProperty from '../../src/lib/mapProperty';
import type { JSONSchema7 } from 'json-schema';

@Entity()
class Example {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @Column()
  mediumint: number;

  @Column({ select: false })
  hidden: string;

  @Column({ type: 'date' })
  datetime: Date;

  @Column({ enum: ['value1', 'value2', 'value3'], update: false })
  string: string;

  @Column({
    type: 'varchar',
    name: 'my_varchar',
    length: 80,
    default: 'hey hey hey',
    unique: true,
    comment: 'This is my uniq string field'
  })
  varchar: string;

  @Column({ nullable: true })
  is_flag: boolean;

  @CreateDateColumn()
  created_at: Date;
}


describe('mapProperty', () => {
  let connection: Connection;
  let schema: Record<string, JSONSchema7>;

  beforeAll(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: './testDB.sql',
      entities: [Example]
    });

    const { columns } = connection.getMetadata(Example);
    schema = columns.reduce((props, column) => ({ ...props, [column.propertyName]: mapProperty(column) }), {});
  });

  afterAll(async () => {
    connection.close();
    fs.unlinkSync('./testDB.sql');
  });

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-10
   */
  test('Should add schema annotations', () => {
    const schemaProperty = schema.varchar;
    expect(schemaProperty.title).toBe('varchar');
    expect(schemaProperty.description).toBe('This is my uniq string field');
    expect(schemaProperty.default).toBe('hey hey hey');

    expect(schema.string.readOnly).toBeTruthy();
    expect(schema.hidden.writeOnly).toBeTruthy();
    // expect(schemaProperty.examples) ?
  });

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.1
   */
  test('Should add schema validation keywords for any instance type', () => {
    let schemaProperty = schema.string;
    expect(schemaProperty.type).toBe('string');
    expect(schemaProperty.enum).toMatchObject(['value1', 'value2', 'value3']);

    schemaProperty = schema.is_flag;
    expect(schemaProperty.type).toBe('boolean');
    // TODO add more type tests
  });

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-6.3
   */
  test('Should add schema validation keywords for strings', () => {
    const schemaProperty = schema.varchar;
    expect(schemaProperty.maxLength).toBe(80);
    // minLength?: number;
    // pattern?: string;
  });
   

  /**
   * @see https://tools.ietf.org/html/draft-handrews-json-schema-validation-01#section-7
   */
  test('Should add semantic validation With "format"', () => {
    const schemaProperty = schema.datetime;
    expect(schemaProperty.format).toBe('date-time');
  });

});
