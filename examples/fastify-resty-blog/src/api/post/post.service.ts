import { Service } from '@fastify-resty/core';
import PostModel from './post.model';

/*
 * Service with logic functionality using injectable PostModel to work with
 * database stored data
 */
@Service()
export default class PostService {
  constructor(private postModel: PostModel) {}

  async getRandomPost() {
    const postsTotal = await this.postModel.total();
    const posts = await this.postModel.find();

    const randomIndex = this.getRandomNumber(0, postsTotal - 1);

    return posts[randomIndex];
  }

  getRandomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
