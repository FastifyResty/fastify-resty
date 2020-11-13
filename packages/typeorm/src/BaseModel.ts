import _ from 'lodash';
import mapProperty from './lib/mapProperty';
import { createSelectQueryBuilder, whereBuilder } from './lib/queryBuilder';
import type { IFindQuery, IFindWhereQuery, IBaseModel, Identifier, ModifyResponse, IModelConfig, IModelOptions } from '@fastify-resty/core';
import type { JSONSchema7 } from 'json-schema';
import type { ObjectType, Connection } from 'typeorm';

export class BaseModel<E extends object = any> implements IBaseModel<E> {

  static connection: Connection;

  constructor(protected EntityClass: ObjectType<E>, config?: IModelOptions) {
    this.config = {
      id: 'id',
      softDelete: false,
      ...(config || {})
    };
  }

  config: IModelConfig;

  get name() {
    return this.EntityClass.name;
  }

  get jsonSchema(): Record<string, JSONSchema7> {
    const { columns } = BaseModel.connection.getMetadata(this.EntityClass);
    return columns.reduce((props, column) => ({ ...props, [column.propertyName]: mapProperty(column)}), {});
  }

  async find(query?: IFindQuery): Promise<E[]> {
    return createSelectQueryBuilder<E>(BaseModel.connection, this.EntityClass, query).getMany();
  }

  async total(query?: IFindWhereQuery): Promise<number> {
    const _queryBuilder = BaseModel.connection
      .getRepository(this.EntityClass)
      .createQueryBuilder('entity');

    if (query) {
      whereBuilder(_queryBuilder, query);
    }

    return _queryBuilder.getCount();
  }

  async create(data: E | E[]): Promise<{ identifiers: Identifier[] }> {
    const result = await BaseModel.connection
      .createQueryBuilder()
      .insert()
      .into(this.EntityClass)
      .values(data)
      .execute();
  
    return { identifiers: _.map(result.identifiers, this.config.id) };
  }

  async patch(query: IFindWhereQuery, raw: Partial<E>): Promise<ModifyResponse> {
    const data = _.omit(raw, this.config.id) as E;

    const _queryBuilder = BaseModel.connection
      .createQueryBuilder()
      .update(this.EntityClass)
      .set(data);

    whereBuilder(_queryBuilder, query);

    return { affected: _.get(await _queryBuilder.execute(), 'affected') };
  }

  async update(query: IFindWhereQuery, raw: E): Promise<ModifyResponse> {
    const data = BaseModel.connection
      .getMetadata(this.EntityClass)
      .columns
      .reduce((data, column) => {
        // allow to not define primary fields
        if (column.isPrimary && raw[column.propertyName] === undefined) { 
          return data;
        }
         // set new date for auto-generated date fields
        if ((column.isCreateDate || column.isUpdateDate || column.isDeleteDate) && raw[column.propertyName] === undefined) { 
          return { ...data, [column.propertyName]: new Date() };
        }
        return { ...data, [column.propertyName]: raw[column.propertyName] };
      }, {});

    const _queryBuilder = BaseModel.connection
      .createQueryBuilder()
      .update(this.EntityClass)
      .set(data);

    whereBuilder(_queryBuilder, query);

    return { affected: _.get(await _queryBuilder.execute(), 'affected') };
  }

  async remove(query: IFindWhereQuery): Promise<ModifyResponse> {
    const _queryBuilder = BaseModel.connection
      .createQueryBuilder()
      .delete()
      .from(this.EntityClass)

    whereBuilder(_queryBuilder, query);

    return { affected: _.get(await _queryBuilder.execute(), 'affected') };
  }
}
