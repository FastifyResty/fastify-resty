export { BaseModel } from './BaseModel';
export { bootstrap } from './bootstrap';

import { bootstrap } from './bootstrap';
export default bootstrap;

/* Types Declarations */

import type { Connection } from 'typeorm';
import type { BaseModel } from './BaseModel';

declare module 'fastify' {
  interface FastifyInstance {
    BaseModel: BaseModel;
    connection: Connection;
  }
}