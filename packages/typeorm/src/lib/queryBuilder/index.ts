import { Brackets } from 'typeorm';
import operations from './operations';
import type { IFindQuery } from '@fastify-resty/core';
import type { ObjectType, SelectQueryBuilder, WhereExpression, Connection } from 'typeorm';

export const whereBuilder = <E>(_query: SelectQueryBuilder<E> | WhereExpression, _where: IFindQuery['$where']): void => {
  let isWhereUsed;
  const getWhere = (prefix: 'and' | 'or' = 'and') => isWhereUsed ? `${prefix}Where` : isWhereUsed = 'where';
  const andWhere = (where, params?) => _query[getWhere()](where, params);

  Object.entries(_where)
    .filter(([key]) => key[0] !== '$')
    .forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value).forEach(([k, v]) => {
          andWhere(...operations[k](key, v as any));
        });
      } else {
        andWhere(...operations['$eq'](key, value));
      }
    });

  if (_where.$or) {
    andWhere(new Brackets(qb => {
      isWhereUsed = null;
      _where.$or.forEach(nestedWhere => {
        qb[getWhere('or')](new Brackets(orqb => {
          whereBuilder(orqb, nestedWhere);
        }));
      });
    }));
  }
}

export const createSelectQueryBuilder = <E>(connection: Connection, entityClass: ObjectType<E>, query: IFindQuery = {}): SelectQueryBuilder<E> => {
  const _query = connection
    .getRepository<E>(entityClass)
    .createQueryBuilder('entity');

  if (query.$select) {
    const select = Array.isArray(query.$select) ? query.$select : [query.$select];
    _query.select(select.map(field => `entity.${field}`));
  }

  if (query.$sort) {
    if (typeof query.$sort === 'string') {
      _query.orderBy(`entity.${query.$sort}`);
    } else if (Array.isArray(query.$sort)) {
      const orderOptions = query.$sort.reduce((acc, curr) => ({ ...acc, [`entity.${curr}`]: 'ASC' }), {});
      _query.orderBy(orderOptions);
    } else if (typeof query.$sort === 'object') {
      _query.orderBy(query.$sort);
    }
  }

  // Notes:
  // $or - always an array! Specify on json schema!!!
  // $where - is object
  if (query.$where) {
    whereBuilder(_query, query.$where);
  }

  if (query.$skip) {
    _query.skip(query.$skip);
  }

  if (query.$limit !== null) {
    _query.take(query.$limit || 20);
  }

  return _query;
}
