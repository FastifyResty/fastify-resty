<p align="center">
<img src="https://raw.githubusercontent.com/Fastify-Resty/fastify-resty/gh-images/logo/full-logo.png" width="650" height="auto"/>
</p>

<div align="center">

![Build Workflow](https://github.com/Fastify-Resty/fastify-resty/workflows/Build%20Workflow/badge.svg?branch=main)
[![codecov](https://codecov.io/gh/Fastify-Resty/fastify-resty/branch/main/graph/badge.svg?token=R11QLZFPCJ)](https://codecov.io/gh/Fastify-Resty/fastify-resty)
[![Known Vulnerabilities](https://snyk.io/test/github/Fastify-Resty/fastify-resty/badge.svg)](https://snyk.io/test/github/Fastify-Resty/fastify-resty)
[![devDependencies Status](https://david-dm.org/Fastify-resty/fastify-resty/dev-status.svg)](https://david-dm.org/Fastify-resty/fastify-resty?type=dev)

</div>

<div align="center">

[![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://GitHub.com/Fastify-Resty/fastify-resty/graphs/commit-activity)
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
- **100% TypeScript** - Written in [TypeScript](https://www.typescriptlang.org/) and comes with all the required typings
- **Declarative interface** - Uses decorators for routes and models definitions
- **Fastify compatible** - Built with [Fastify](https://www.fastify.io/) and supports all its features and plugins
- **Built-in DI** - Provides simple Dependency Injection interface to bind your entries
- **ASAP** - Which means *as simple as possible* for us

## Install :pushpin:

**Using Yarn:**

```sh
yarn add @fastify-resty/core @fastify-resty/typeorm fastify typeorm
```

**Using NPM:**

```sh
npm install @fastify-resty/core @fastify-resty/typeorm fastify typeorm
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
class AuthorController {}

export default AuthorController;
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
- [Services](./Services.md) :label:
- [Dependency Injection](./Dependency-Injection.md) :label:

## Packages :package:

- [@fastify-resty/core](https://www.npmjs.com/package/@fastify-resty/core) - **Fastify Resty** core functionality
- [@fastify-resty/typeorm](https://www.npmjs.com/package/@fastify-resty/typeorm) - **Fastify Resty** TypeORM connector

## Examples :microscope:

- [Fastify Resty Blog API](https://github.com/Fastify-Resty/fastify-resty/tree/main/examples/fastify-resty-blog)
- [Fastify Resty Quickstart](https://github.com/Fastify-Resty/fastify-resty/tree/main/examples/fastify-resty-quickstart)

## Issues and contributions :memo:

Contributors are welcome, please fork and send pull requests! If you find a bug or have any ideas on how to improve this project please submit an issue.

## License
[MIT License](https://github.com/Fastify-Resty/fastify-resty/blob/main/LICENSE.md)

Icons made by <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">Eucalyp</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>