import fastify from 'fastify';
import { createConnection } from 'typeorm';
import { bootstrap } from '@fastify-resty/core';
import typeorm from '@fastify-resty/typeorm';

import { PostController } from './post.controller';

async function main() {
  // 1. Create fastify server instance
  const app = fastify();

  // 2. Initialize TypeORM connection using sqlite3 module
  const connection = await createConnection({
    type: 'sqlite', // specify sqlite type
    synchronize: true, // ask TypeORM to create db tables, if not exists
    database: './testDB.sql', // path to store sql db source
    entities: ['src/*.entity.ts'] // pattern to autoload entity files
  });

  // 3. Register TypeORM module 
  app.register(typeorm, { connection });

  // 4. Register FastifyResty controller
  app.register(bootstrap, { controllers: [PostController] });

  // 5. Start application server on port 8080
  app.listen(8080, (err, address) => {
    console.log(`Server is listening on ${address}`);
    console.log(app.printRoutes());
  });
}

main();
