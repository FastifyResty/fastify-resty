export { Model } from './Model';
export { bootstrap } from './bootstrap';

import { bootstrap } from './bootstrap';
export default bootstrap;

/* Types Declarations */

import type { Connection } from 'typeorm';
import type { Model } from './Model';

declare module 'fastify' {
  interface FastifyInstance {
    Model: Model;
    connection: Connection;
  }
}