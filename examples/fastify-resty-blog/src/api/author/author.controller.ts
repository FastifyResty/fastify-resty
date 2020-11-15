import { EntityController } from '@fastify-resty/core';
import AuthorEntity from './author.entity';

/*
 * Zero-configuration controller which will generate all the REST routes
 * for Author data entity
 */
@EntityController(AuthorEntity, '/authors')
class AuthorController {}

export default AuthorController;
