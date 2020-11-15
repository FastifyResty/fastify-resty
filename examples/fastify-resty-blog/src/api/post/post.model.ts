import { Model } from '@fastify-resty/core';
import { BaseModel } from '@fastify-resty/typeorm';
import PostEntity from './post.entity';

/*
 * Injectable model to be included in PostService
 */
@Model(PostEntity)
export default class PostModel extends BaseModel {}
