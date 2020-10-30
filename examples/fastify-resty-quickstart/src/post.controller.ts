import { EntityController } from '@fastify-resty/core';
import { PostEntity } from './post.entity';

@EntityController(PostEntity, '/posts')
export class PostController {}
