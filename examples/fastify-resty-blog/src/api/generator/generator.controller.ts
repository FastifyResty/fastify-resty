import { Controller, GET } from '@fastify-resty/core';
import GeneratorService from './generator.service';
import type { FastifyRequest } from 'fastify';

const getAuthorSchema = {
  querystring: {
    multy: { type: 'number' }
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        total: { type: 'number' },
        firstname: { type: 'string' },
        lastname: { type: 'string' }
      }
    }
  }
};

/*
 * Custom controller without data routes generation.
 * Uses logic of GeneratorService injected with DI
 */
@Controller('/generate')
export default class GeneratorController {
  constructor(private generatorService: GeneratorService) {}

  @GET('/author', { schema: getAuthorSchema })
  async getAuthor(request: FastifyRequest<{ Querystring: { multy?: number } }>) {
    const itemsCount = request.query.multy;

    if (itemsCount) {
      const authors = [];
      
      for (let i = 0; i < itemsCount; i++) {
        authors.push(this.generatorService.generateAuthor());
      }

      return { total: itemsCount, data: authors };
    }

    return this.generatorService.generateAuthor();
  }

  @GET('/post')
  async getPost() {
    return this.generatorService.generatePost();
  }
}
