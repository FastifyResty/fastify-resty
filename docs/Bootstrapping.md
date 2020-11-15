# Bootstrapping

**Fastify Resty** provides powerful tools like `Controller` and `EntityController` 
to define API routes in a clear and declarative way using TypeScript decorators 
and classes.

## Controllers loading

To register our controllers we need to specify them on a **Fastify Resty** 
bootstrap plugin by direct passing or/and autoloading by filename pattern.

```ts
import * as path from 'path';
import fastify from 'fastify';
import { bootstrap } from '@fastify-resty/core';

import UsersController from './users.controller';
import PostsController from './posts.controller';

async function main() {

  const app = fastify();

  app.register(bootstrap, {
    // autoload controllers from "api" directory, using filename match pattern
    entry: path.resolve(__dirname, 'api'),
    // direct controllers declaration
    controllers: [UsersController, PostsController]
  });

  app.listen(8080, (err, address) => {
    console.log(`Server is listening on ${address}`);
  });
}

main();
```

You also are able to specify your own pattern for controller filename match:

```ts
app.register(bootstrap, {
  entry: path.resolve(__dirname, 'api'),
  pattern: /\.ctr\.ts$/
});
```

## Application options

`EntityController` is able to have its own configuration, but by default, the global 
**Fastify Resty** configuration is used for all. We are able to overwrite it, so in this 
case, default and your configuration will be merged.

```ts
app.register(bootstrap, {
  entry: path.resolve(__dirname, 'api'),
  defauls: {
    id: '_id', // change the name of entities primary field
    pagination: false // turn of the pagination
  }
});
```

## Bootstrap configuration options

| Option | Type | Default value | Description |
| --- | --- | --- | --- |
| `pattern` | `RegExp` | `/\.controller\.[jt]s$/` | Filename pattern to load controllers files |
| `controllers` | `Array` | - | Array of controllers to be registred |
| `entry` | `String` | - | Root path for controllers autoload |
| `defaults.id` | `String` | "id" | The name of primary field in your database schemas |
| `defaults.methods` | `Array` | - | The list of methods which will be created for controller endpoint. See the available methods on [EntityController Routes](./Entity-Controllers.md#entitycontroller-routes). If not specified, all the methods are registed |
| `defaults.allowMulti` | `Boolean` | `true` | Defines if we need to register methods for handling mutly rows operations, like `PATCH` or `DELETE` multy rows |
| `defaults.returning` | `Boolean` | `true` | The flag to return the result of completed action. Will cause an additinal request to get it. |
| `defaults.pagination` | `Object / Boolean` | + | Set `false` to disable pagination or an object to configure it |
| `defaults.pagination.limit` | `Number` | 20 | The default limit for returned query rows |
| `defaults.pagination.total` | `Boolean` | `true` | Defines if we need to return total results count for `GET /` query |
