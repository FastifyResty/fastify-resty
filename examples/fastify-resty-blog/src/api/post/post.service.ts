import { IBaseModel, Model, Service } from '@fastify-resty/core';
import PostEntity from './post.entity';

/*
 * Service with logic functionality using injectable PostModel to work with
 * database stored data
 */
@Service()
export default class PostService {  
  @Model(PostEntity)
  postModel: IBaseModel<PostEntity>;

  async getRandomPost() {
    const postsTotal = await this.postModel.total();
    const posts = await this.postModel.find();

    return posts[this.getRandomNumber(0, postsTotal - 1)];
  }

  getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
