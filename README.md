<p align="center">
<img src="https://raw.githubusercontent.com/FastifyResty/fastify-resty/gh-images/logo/full-logo.png" width="650" height="auto"/>
</p>

<div align="center">

![Build Workflow](https://github.com/FastifyResty/fastify-resty/workflows/Build%20Workflow/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/FastifyResty/fastify-resty/branch/main/graph/badge.svg?token=R11QLZFPCJ)](https://codecov.io/gh/FastifyResty/fastify-resty)
[![Known Vulnerabilities](https://snyk.io/test/github/FastifyResty/fastify-resty/badge.svg)](https://snyk.io/test/github/FastifyResty/fastify-resty)
[![Depfu](https://badges.depfu.com/badges/c43ccc83fdcc48e031489f54ef8f4194/overview.svg)](https://depfu.com/github/FastifyResty/fastify-resty?project_id=17745)

</div>

<div align="center">

[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/FastifyResty/fastify-resty/graphs/commit-activity)
[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

</div>

> **Modern and declarative REST API framework for superfast and oversimplification backend development, build on top of Fastify and TypeScript.**

<hr>
<p align="center">
If you find this useful, please don't forget to star :star:&nbsp; the repo, as this will help to promote the project.
</p>
<hr>

## Benefits :dart:

- **Zero configuration** - Generates [RESTful API](https://restfulapi.net/) routes for your data out the box
- **JSON Schema validation** - Build [JSON Schemas](https://json-schema.org/) to validate and speedup your requests and replies
- **Highly customizable** - provides a lot of possible configurations for your application
- **Purely TypeScript** - Written in [TypeScript](https://www.typescriptlang.org/) and comes with all the required typings
- **Declarative interface** - Uses decorators for routes and models definitions
- **Fastify compatible** - Built with [Fastify](https://www.fastify.io/) and supports all its features and plugins
- **Built-in DI** - Provides simple Dependency Injection interface to bind your entries

## Install :pushpin:

#### Core module

```sh
$ npm install @fastify-resty/core fastify
```

#### TypeORM connector

```sh
$ npm install @fastify-resty/typeorm typeorm
```

## Usage :rocket:

##### TypeORM Entity (author.entity.ts):

```ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export default class Author {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @CreateDateColumn()
  created_at: Date;
}
```

##### Entity controller (author.controller.ts):

```ts
import { EntityController } from '@fastify-resty/core';
import AuthorEntity from './author.entity';

@EntityController(AuthorEntity, '/authors')
export default class AuthorController {}
```

##### Bootstrap (app.ts):

```ts
import fastify from 'fastify';
import { createConnection } from 'typeorm';
import { bootstrap } from '@fastify-resty/core';
import typeorm from '@fastify-resty/typeorm';
import AuthorController from './author.controller';

async function main() {
  const app = fastify();
  const connection = await createConnection();

  app.register(typeorm, { connection });
  app.register(bootstrap, { controllers: [AuthorController] });

  app.listen(8080, (err, address) => {
    console.log(app.printRoutes());
  });
}

main();
```

##### Generated routes:

```
└── /
    └── users (DELETE|GET|PATCH|POST|PUT)
        └── / (DELETE|GET|PATCH|POST|PUT)
            └── :id (DELETE)
                :id (GET)
                :id (PATCH)
                :id (PUT)
```

## Documentation :books:

- [Quickstart](./docs/Quickstart.md) :label:
- [Application Structure](./docs/Application-Structure.md) :label:
- [Bootstrapping](./docs/Bootstrapping.md) :label:
- [Controllers](./docs/Controllers.md) :label:
- [Entity Controllers](./docs/Entity-Controllers.md) :label:
- [Model](./docs/Model.md) :label:
- [Services](./docs/Services.md) :label:
- [Dependency Injection](./docs/Dependency-Injection.md) :label:

## Packages :package:

- [@fastify-resty/core](https://www.npmjs.com/package/@fastify-resty/core) - **Fastify Resty** core functionality
- [@fastify-resty/typeorm](https://www.npmjs.com/package/@fastify-resty/typeorm) - **Fastify Resty** TypeORM connector

## Examples :microscope:

- [Fastify Resty Quickstart](https://github.com/FastifyResty/fastify-resty/tree/main/examples/fastify-resty-quickstart)
- [Fastify Resty Blog API](https://github.com/FastifyResty/fastify-resty/tree/main/examples/fastify-resty-blog)

## Issues and contributions :memo:

Contributors are welcome, please fork and send pull requests! If you find a bug or have any ideas on how to improve this project please submit an issue.

## License
[MIT License](https://github.com/FastifyResty/fastify-resty/blob/main/LICENSE.md)

Icons made by <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">Eucalyp</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>