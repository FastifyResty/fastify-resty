# Entity Controllers

## Overview

**Entity Controllers** is the most powerful and excited feature provided by **Fastify Resty**. It allows you to create and REST API interface for your data models with zero-configuration. At the same time, all the methods will be high speed and reliable, because **Entity Controllers** generates [JSON Schema](https://json-schema.org/) to validate the routes and serialize their outputs.

Automatically generated endpoints are happy to be extended or rewritten for some tricky cases. They also support some configuration to adjust the generate behavior.

## Basic usage

All that we need to generate REST endpoint for your data model is just an empty controller, decorated with `@EntityController` decorator, and **Entity** class which has all the data schema definitions.

```ts
import { EntityController } from '@fastify-resty/core';
import UserEntity from './user.entity';

@EntityController(UserEntity, '/users')
export default class UserController {}
```

The example above will generate the following routes:

```
└── /
    └── users (DELETE|GET|PATCH|POST|PUT)
        └── / (DELETE|GET|PATCH|POST|PUT)
            └── :id (DELETE)
                :id (GET)
                :id (PATCH)
                :id (PUT)
```

> **Note!** `EntityController` class has to be default exported to be handled by 
the autoloading mechanism.

## EntityController routes

| Route | HTTP Method | Controller method | Description |
| --- | --- | --- | --- |
| `/` | `GET` | `find` | Send a list of resources |
| `/:id` | `GET` | `findOne` | Send a resource by `id` URL parameter |
| `/` | `POST` | `create` | Create one and more new resources |
| `/` | `PATCH` | `patch` | Update one or more fields on a queried resources |
| `/:id` | `PATCH` | `patchOne` | Update one or more fields on a resource by `id` URL parameter |
| `/` | `PUT` | `update` | Update/Replace queried resources |
| `/:id` | `PUT` | `updateOne` | Update/Replace resource by `id` URL parameter |
| `/` | `DELETE` | `remove` | Delete queried resources |
| `/:id` | `DELETE` | `removeOne` | Delete resources by `id` URL parameter |

## Querying

Generated **EntityControllers** provides a query search interface for direct data selection out the box. You are able to use all the available [Query Operators](./Model.md#query-operations) in your query strings for the endpoints.

We recommend using [qs library](https://www.npmjs.com/package/qs) for query string generation.

### Query examples

#### Example 1

Model query:

```ts
await model.find({
  $limit: 20,
  $where: {
    title: 'Article',
    id: { $lt: 10 },
    age: { $gte: 18, $lte: 65 },
    $or: [
      { name: 'Jhon' },
      { lastname: { $in: ['Doe', 'Timbersaw'] } }
    ]
  }
});
```

URL query:

> (`GET`) `/route/?$limit=20&$where[title]=Article&$where[id][$lt]=10&$where[age][$gte]=18&$where[age][$lte]=65&$where[$or][0][name]=Jhon&$where[$or][1][lastname][$in][]=Doe&$where[$or][1][lastname][$in][]=Timbersaw`

#### Example 2

Model query:

```ts
await model.delete({
  id: { $in: [10, 20, 30] }
});
```

URL query:

> (`DELETE`) `/route?id[$in][0]=10&id[$in][1]=20&id[$in][2]=30`

## Customization and configuration

### Requests and hooks methods

All the common controller hooks and methods are supported on **EntityController**. See the reference on [Controllers](./Controllers.md) documentation.

### Properties

In the same as **Controller**, **EntityController** adds some helpful properties to each class that might be needed for custom additional logic or default methods overriding.

| Property | Type | Description |
| --- | --- | --- |
| `config` | `IControllerConfig` | The controller-specific configuration, defined for the **EntityController** |
| `model` | `IBaseModel` | [Model](./Model.md) instance for controller entity |

Despite they already available on entity controller class, it would be better to declare them with related types, to have type suggestion, and avoid TypeScript compilation errors.

```ts
import { EntityController, IControllerConfig, IBaseModel } from '@fastify-resty/core';
import UserEntity from './user.entity'
import type { FastifyInstance } from 'fastify';

@EntityController(UserEntity, '/users')
export default class UserController {

  config: IControllerConfig;

  model: IBaseModel<UserEntity>;

}
```

### Configuration reference

```ts
@EntityController(entity: Function, route: string, options?: IControllerConfig);
```

**EntityController** decorator options:

| Argument | Type | isRequired | Description | Default |
| --- | --- | --- | --- | --- |
| `entity` | `class` | yes | The entity class containing data schema definitions. | - |
| `route` | `string` | no | Controller's endpoint root path. All the controller's routes will be starting with it. | `/` |
| `options` | `object` (`IControllerConfig`) | no | Controller specific optional configuration. By default, application `default*` configuration is used. If controller options object is set, it will be merged with application config with rewrite specified fields. | `{ pagination: false, id: 'id', allowMulti: true, returning: true }` |

`*` See the possible `defaults` options on [Bootstrap configuration options](./Bootstrapping.md#bootstrap-configuration-options) docs.
