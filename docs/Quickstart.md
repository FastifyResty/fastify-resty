# Quick Start :running::dash:

## What is it about?

In this quick start guide, we will create a basic API using `Fastify Resty` framework. 
The main goal here is to show how easily we can create all the request data schema mappings
using the generated CRUD API interface.

## What is used?

- [NODE.JS](https://nodejs.org/en/about/) (`v12.4.1`)
- [Fastify](https://www.fastify.io/) (`v3`)
- [TypeORM](https://typeorm.io/#/)
- [SQLite 3](https://www.sqlite.org/index.html)
- [Yarn](https://yarnpkg.com/)

> We'll use file-based database `SQLite 3` here to keep things simple, but that's fine if you proceed with any other database which is supported by `TypeORM`.

## Let's get in! :rocket:

### :one:&nbsp; Project initialization:

As the first step, we need to simply create the project folder and initialize `package.json` here.

```sh
$ mkdir app & cd app # create app dir and go there
$ mkdir src # directory where we will put our code
$ yarn init # init package.json using Yarn
```

### :two:&nbsp; Install dependencies:

First of all, we need to install `Fastify Resty` core functionality and `fastify`, because that is the foundation of our application and `Fastify Resty` is built on top of it.

```sh
$ yarn add @fastify-resty/core fastify
```

Then, the packages to work with our data. To work with `TypeORM` entities we need to add it to our project and the related `Fastify Resty TypeORM` connector.

```sh
$ yarn add @fastify-resty/typeorm typeorm sqlite3
```

To run and compile our `TypeScript` source code we need to install
the following development dependencies:

```sh
$ yarn add -D typescript ts-node
```

### :three:&nbsp; Add TypeScript configuration:

`Fastify Resty` provides nice looking and declarative interface with decorators, so we need to 
create a `tsconfig.json` at the project root directory.

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "outDir": "./dist"
  }
}
```

That's it, we are done with the project setup. Now we could move to the important things and develop our API! :muscle:

### :four:&nbsp; Create TypeORM Entity model:

First thing first, we want to define our first data entity using `TypeORM`. It provides decorators for different data types. See them on the [TypeORM Entities](https://typeorm.io/#/entities) reference.

Here, we will create a simple entity that will have a primary `id` field and `title` which has a string type.

`src/post.entity.ts`:

```ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;
}
```

### :five:&nbsp; Create a controller to work with the entity:

That's the most exciting part.

To generate an API interface to interact with our created entity we need to just create a controller class and decorate it with `EnityController` decorator which is provided by `Fastify Resty`.

As an argument, we'll pass our entity class and specify the route URL `/posts` to be the root path for our API endpoint.

`src/post.controller.ts`:

```ts
import { EntityController } from '@fastify-resty/core';
import { PostEntity } from './post.entity';

@EntityController(PostEntity, '/posts')
export class PostController {}
```

It's all, right? Yeah :sunglasses:

### :six:&nbsp; Setup Fastify server

In the end, we need to setup your server and put all the things together.

`src/app.ts`:

```ts
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
    database: './testDB.sql', // path to store sql db source
    entities: ['*.entity.ts'] // pattern to autoload entity files
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
```

Some notes about server setup steps at the code listing above:

- `Steps 1 and 2` are the common setup of Fastify and TypeORM. You could see more details 
about them on the related documentation references.

- `Step 3` - we register FastifyResty TypeORM wrapper and pass the created database
connection in there. That's required for Fastify Resty `EntityController` to
manage the data using the model interface, provided by Fastify Resty TypeORM connector.

- `Step 4` is actual FastifyResty bootstrap with a minimal configuration where we pass 
our created controller to be registered.

- `Step 5` runs fastify server listening and call the callback function after it's ready.

### :seven:&nbsp; That's it! Run the server.

Finally, we have our API application ready to be run and served. To do it
go to the console command line again (make sure that you are in the project dir)
and run the following command:

```sh
$ yarn ts-node src/app.ts
```

If heaven favors you will see the message below, which says that
our API server is running on `http://127.0.0.1:8080` address and ready
to pick up and handle requests for the `http://127.0.0.1:8080/posts/` endpoint.

```
Server is listening on http://127.0.0.1:8080
└── /
    └── posts (DELETE|GET|PATCH|POST|PUT)
        └── / (DELETE|GET|PATCH|POST|PUT)
            └── :id (DELETE)
                :id (GET)
                :id (PATCH)
                :id (PUT)
```

## Let's play with it! :bouncing_ball_person:

To make the requests to API with different HTTP request types we suggest to use [Postman](https://www.postman.com/downloads/) 
or [Insomnia](https://insomnia.rest/download/). They are both free and do their job very well.

- First of all, let's check the list of posts. For that you need to send the following `GET` request:

| Method | Url |
| --- | --- |
| `GET` | `http://127.0.0.1:8080/posts/` |


The response would be `{ "total":0, "limit":20, "skip":0, "data": []}`. That's right, 
we don't have any posts yet, so `data` is empty array here.

- We need to add a few posts to see them. For that let's send a request with `POST` 
method and post data in the body:

| Method | Url | Body |
| --- | --- | --- |
| `POST` | `http://127.0.0.1:8080/posts/` | `{ name: "My first post" }` |

Oops, something went wrong here. We forgot that we define the post name as `title` 
field on our TypeORM schema, and our API's response tells us about it:

```json
{
    "statusCode": 400,
    "error": "Bad Request",
    "message": "body should have required property 'title'"
}
```

That's fine, let's change the `name` to `title` and send a request one more time! As 
the result, we see `[1]`, so that's a signal that a new post was added! You could add a 
few more posts, but we go further.

- Now we have the post added so can go back to the first step and ask for the posts list again:

| Method | Url |
| --- | --- |
| `GET` | `http://127.0.0.1:8080/posts/` |

Wow, now we have received our post:

```json
{
  "total": 1,
  "limit": 20,
  "skip": 0,
  "data": [{
    "id": 1,
    "title": "My first post"
  }]
}
```

## Afterwords :pray:

In this guide, we have created our API using Fastify Resty framework. There 
are more possibilities and available things that not covered here, but you are ready for 
absorbing further documentation.

The source code of this quickstart application is available on <LINK>, take a look if 
you have missed something!
