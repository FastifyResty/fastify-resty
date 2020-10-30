import { EntityController, GET, OnRequest } from '@fastify-resty/core';
import PostEntity from './post.entity';
import type { FastifyRequest, FastifyInstance } from 'fastify';

@EntityController(PostEntity, '/posts')
class PostController {
  private instance: FastifyInstance;

  @GET('/:id/author', {
    schema: {
      params: {
        id: { type: 'number' }
      },
      response: {
        200: {
          firstname: { type: 'string' },
          lastname: { type: 'string' }
        }
      }
    }
  })
  async getPostAuthor(request: FastifyRequest<{ Params: { id: number } }>) {
    const typeormRepository = this.instance.connection.getRepository(PostEntity);
    const result = await typeormRepository.find({
      where: { id: request.params.id },
      relations: ['author']
    });
    return result[0].author;
  }
 
  @OnRequest
  async onRequests(request) {
    console.log(`Request #${request.id}`);
  }
}

export default PostController;
