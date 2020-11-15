import { Service } from '@fastify-resty/core'; 
import * as faker from 'faker';

/*
 * Simple injectable service provided some logical functionality
 */
@Service()
export default class GeneratorService {
  generateAuthor() {
    return {
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName()
    };
  }

  generatePost() {
    return {
      title: faker.lorem.words(),
      description: faker.lorem.sentence(),
      image: faker.image.imageUrl(),
      content: faker.lorem.paragraph(),
      is_draft: faker.random.boolean()
    };
  }
}
