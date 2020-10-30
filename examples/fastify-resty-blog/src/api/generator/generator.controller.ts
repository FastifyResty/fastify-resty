import { Controller, GET } from '@fastify-resty/core';
import * as faker from 'faker';
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

@Controller('/generate')
export default class GeneratorController {
  @GET('/author', { schema: getAuthorSchema })
  async getAuthor(request: FastifyRequest<{ Querystring: { multy?: number } }>) {
    const itemsCount = request.query.multy;

    if (itemsCount) {
      const data = [];

      for (let i = 0; i < itemsCount; i++) {
        data.push({
          firstname: faker.name.firstName(),
          lastname: faker.name.lastName()
        });
      }
  
      return { total: itemsCount, data };
    }

    return {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName()
    };
  }

  @GET('/post')
  async getPost() {
    return {
      title: faker.lorem.words(),
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl(),
      content: faker.lorem.paragraph(),
      is_draft: faker.random.boolean()
    };
  }
}
