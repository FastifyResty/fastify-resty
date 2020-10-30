import * as path from 'path';
import fastify from 'fastify';
import { createConnection } from 'typeorm';
import { bootstrap } from '@fastify-resty/core';
import typeorm from '@fastify-resty/typeorm';


async function main() {
  // create fastify server instance
  const app = fastify();

  // initialize typeorm connection
  const connection = await createConnection();

  // register fastify-resty typeorm bootstraper
  app.register(typeorm, { connection });

  // bootstrap fastify-resty controllers using autoloader 
  app.register(bootstrap, { entry: path.resolve(__dirname, 'api') });

  // start server listen on port 8080
  app.listen(8080, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log(`Server is listening on ${address}`);
    console.log(app.printRoutes());
  });
}

main();
