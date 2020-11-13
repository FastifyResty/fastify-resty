import { EntityController, GET, OnRequest, Inject } from '@fastify-resty/core';
import PostEntity from './post.entity';
import PostService from './post.service';
import type { FastifyRequest } from 'fastify';
import type { Connection } from 'typeorm';

/*
 * Extended automatically REST generation controller with custom
 * hooks and methods.
 * Uses injected Fastify decorated property "connection" provided by
 * @fastify-resty/typeorm library and PostService service with some logic
 */
@EntityController(PostEntity, '/posts')
class PostController {
  constructor(private postService: PostService) {}

  @Inject('connection')
  private connection: Connection;

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
    const typeormRepository = this.connection.getRepository(PostEntity);
    const result = await typeormRepository.find({
      where: { id: request.params.id },
      relations: ['author']
    });
    return result[0].author;
  }

  @GET('/random')
  async findRandomPost() {
    return this.postService.getRandomPost();
  }
 
  @OnRequest
  async onRequests(request) {
    console.log(`Request #${request.id}`);
  }
}

export default PostController;
