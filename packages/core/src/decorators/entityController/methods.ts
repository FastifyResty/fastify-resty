import createError from 'http-errors';
import { get } from '../../helpers';

import type { FastifyRequest } from 'fastify';
import type { IFindQuery, IFindWhereQuery, Identifier, IControllerConfig, IPagination } from '../../types';

declare type Entity = any;

const getPaginationConfig = (config: IControllerConfig): IPagination | null => typeof config.pagination === 'boolean' ? null : config.pagination;

export default {
  async find(request: FastifyRequest<{ Querystring: IFindQuery }>) {
    const query = request.query;
    
    if (!this.config.pagination) {
      return { data: this.model.find(query) };
    }

    const paginationConfig = getPaginationConfig(this.config);

    if (paginationConfig && query.$limit === undefined) {
      query.$limit = paginationConfig.limit;
    }

    return {
      data: await this.model.find(query),
      skip: query.$skip || 0,
      limit: query.$limit || paginationConfig.limit,
      total: paginationConfig.total && await this.model.total(query)
    };
  },
  async findOne(request: FastifyRequest<{ Params: { id: Identifier; } }>) {
    const results = await this.model.find({ $where: { [this.config.id]: request.params.id } });
    
    if (results.length === 0) {
      throw createError(404, `${this.model.name} #${request.params.id} is not found`);
    }

    return results[0];
  },
  async create(request: FastifyRequest<{ Body: Entity, Querystring: { $results: boolean } }>) {
    const { identifiers } = await this.model.create(request.body);

    if (get(request.query.$results, this.config.returning)) {
      return await this.model.find({ $where: { [this.config.id]: { $in: identifiers } } });
    }

    return identifiers;
  },
  async patch(request: FastifyRequest<{ Body: Entity, Querystring: IFindWhereQuery & { $results?: boolean } }>) {
    const response: any = {};

    let patchIds: number[];
    if (get(request.query.$results, this.config.returning)) {
      const patchQuery = await this.model.find({ $select: [this.config.id], $where: request.query });
      patchIds = patchQuery.map(row => row[this.config.id]);
    }

    const { affected } = await this.model.patch(request.query, request.body);
    response.affected = affected; 
    
    if (get(request.query.$results, this.config.returning)) {
      response.data = await this.model.find({ $where: { [this.config.id]: { $in: patchIds } } });
    }

    return response;
  },
  async patchOne(request: FastifyRequest<{ Params: { id: Identifier; }, Body: Entity, Querystring: { $results: boolean } }>) {
    const { params: { id }, query: { $results } } = request;
    const { affected } = await this.model.patch({ [this.config.id]: id }, request.body);

    if (get($results, this.config.returning)) {
      return (await this.model.find({ $where: { [this.config.id]: id } }))[0];
    }

    return { affected };
  },
  async update(request: FastifyRequest<{ Body: Entity, Querystring: IFindWhereQuery | { $results: boolean } }>) {
    const response: any = {};

    let updateIds: number[];
    if (get(request.query.$results, this.config.returning)) {
      const updateQuery = await this.model.find({ $select: [this.config.id], $where: request.query });
      updateIds = updateQuery.map(row => row[this.config.id]);

      if (!updateIds.length) {
        return { affected: 0, data: [] };
      }
    }

    const { affected } = await this.model.update(request.query, request.body);
    response.affected = affected;

    if (get(request.query.$results, this.config.returning)) {
      response.data = await this.model.find({ $where: { [this.config.id]: { $in: updateIds } } });
    }

    return response;
  },
  async updateOne(request: FastifyRequest<{ Params: { id: Identifier; }, Body: Entity, Querystring: { $results: boolean } }>) {
    const { params: { id }, query: { $results } } = request;
    const { affected } = await this.model.update({ [this.config.id]: id }, request.body);

    if (get($results, this.config.returning)) {
      const result = await this.model.find({ $where: { [this.config.id]: id } });
      return result[0];
    }

    return { affected };
  },
  async remove(request: FastifyRequest<{ Querystring: IFindWhereQuery | { $results: boolean } }>) {
    const response: any = {};

    if (get(request.query.$results, this.config.returning)) {
      response.data = await this.model.find({ $where: request.query });

      if (!response.data.length) {
        return { affected: 0, data: [] };
      }
    }

    const { affected } = await this.model.remove(request.query);
    response.affected = affected;

    return response;
  },
  async removeOne(request: FastifyRequest<{ Params: { id: Identifier; }, Querystring: { $results: boolean } }>) {
    const { params: { id }, query: { $results } } = request;
    let removedRow;

    if (get($results, this.config.returning)) {
      const results = await this.model.find({ $where: { [this.config.id]: id } });
      if (results.length === 0) {
        throw createError(404, `${this.model.name} #${request.params.id} is not found to be removed`);
      }

      removedRow = results[0];
    }

    const { affected } = await this.model.remove({ [this.config.id]: id });

    if (get($results, this.config.returning)) {
      return removedRow;
    }

    return { affected };
  }
};
