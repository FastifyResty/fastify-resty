import { EntityController } from '@fastify-resty/core';
import AuthorEntity from './author.entity';

@EntityController(AuthorEntity, '/authors')
class AuthorController {}

export default AuthorController;
