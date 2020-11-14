# Model

**Fastify Resty** database adaptors, like `@fastify-resty/typeorm` provides extendable `BaseModel`
class wrappers to create a simple interface for the interaction with your model entities.

It was designed for `EntityController` to work with database entities,
but you are able to use them independently for your needs.

## Bootstrap

To register the connector we need to pass the **Type ORM** `connection` object to it
as a fastify plugin option. **Fastify Resty TypeORM** will [decorate](https://www.fastify.io/docs/latest/Decorators/) 
it to `fastify` instance, so not needed to do this manually.

With that, it also decorates `BaseModel` class which could be used to create an interactive 
instance based on your TypeORM Entity.

```ts
import fastify from 'fastify';
import typeorm from '@fastify-resty/typeorm';
import { createConnection } from 'typeorm';

async function main() {
  const app = fastify();

  // initialize typeorm connection
  const connection = await createConnection();

  // register fastify-resty typeorm bootstraper
  app.register(typeorm, { connection });
}
```

## Standalone usage

Models instances are created and available on `EntityControllers`, but you also able to 
create and use them yourselves if needed.

```ts
import { BaseModel } from '@fastify-resty/typeorm';
import { createConnection } from 'typeorm';

// initialize connection
const connection = await createConnection();

// bootstrap static property
BaseModel.connection = connection;

// use
const model = new BaseModel(Entity);
```

## Injectable usage

To create specific API logic working with data we might need basic `BaseModel` methods to achieve that. 
`BaseModel` couldn't be injected into somewhere because it's constructor class, but we are able to extend 
it and decorate with `@Model` decorator.

```ts
import { Model } from '@fastify-resty/core';
import { BaseModel } from '@fastify-resty/typeorm';

import SampleEntity from './sample.entity.ts';

@Model(SampleEntity)
export default class SampleModel extends BaseModel {}
```

You are able to set a model-specific configuration to the first `@Model` decorator argument:

```ts
@Model(SampleEntity, { id: '_id' })
```

## BaseModel Methods

### Find

```ts
find(query?: IFindQuery): Promise<E[]>
```

Returns the array of items, according to passed `query`.

```ts
const results = await model.find({
  $select: ['id', 'title', 'name'], // select only specific fields
  $limit: 50, // return only the first 50 rows
  $sort: { age: 'DESC' }, // sort by "age" using a descending order
  $where: { // search conditions
    title: 'How are you',
    id: { $lt: 10 },
    age: { $gte: 18, $lte: 65 },
    $or: [{ name: 'Jhon' }, { lastname: { $in: ['Doe', 'Loe'] } }],
  }
});
```

### Total

```ts
total(query?: IFindWhereQuery): Promise<number>
```

Returns the total count of items (number), according to passed `query`.

```ts
const count = await model.total({ id: { $nin: [10, 20, 30] } });

console.log(count); // 10
```

### Create

```ts
create(data: E | E[]): Promise<{ identifiers: Identifier[] }>
```

Creates one or more rows and returns the array of created primary keys.

```ts
const result = await model.create([
  { name: 'Ms. Joanne Harris', age: 34 },
  { name: 'Matilda Pouros', age: 26 }
]);

console.log(result); // { identifiers: [1, 2] }
```

### Patch

```ts
patch(query: IFindWhereQuery, raw: Partial<E>): Promise<ModifyResponse>
```

Updates one or more fields on the rows that match a `query`. The rest of the fields on 
updated rows will stay unchanged. Method execution returns the count of affected rows.

```ts
const result = await model.patch(
  { id: { $in: [28, 29] } },
  { title: 'Patched', views: 0 }
);

console.log(result); // { affected: 2 }
```

### Update

```ts
update(query: IFindWhereQuery, raw: E): Promise<ModifyResponse>
```

Recreates rows that match a `query`. In more detail, it creates a new row and replaces 
matched `query` rows with it. Returns count of affected rows.

```ts
const result = await model.update(
  { id: 10 },
  { title: 'Updated', description: 'lorem', views: 0 }
);

console.log(result); // { affected: 1 }
```

### Remove

```ts
remove(query: IFindWhereQuery): Promise<ModifyResponse>
```

Removes the rows that match `query` and return the count of affected rows.

```ts
const result = await model.delete({ status: 'to_be_removed' });

console.log(result); // { affected: 6 }
```

## Model Properties

- `name` - model name, in most cases the name of the **Entity**

- `jsonSchema` - entity's data schema converted to [JSON Schema](https://json-schema.org/) format. 

## Model Quering

### Find options (`IFindQuery`)

| Option | SQL | Example |
| --- | --- | --- |
| `$limit` | `LIMIT` | `{ $limit: 20 }` |
| `$skip` | `OFFSET` | `{ $skip: 10 }` |
| `$select` | `SELECT` | `{ $select: ['title', 'description'] }` |
| `$sort` | `ORDER BY` | `{ $sort: 'age' }` / `{ $sort: ['age', 'name'] }` / `{ $sort: { age: 'ASC' } }` |
| `$where` | `WHERE` | `{ $where: { id: 20 } }` |

### Query Operations

| Operator | SQL | Example |
| --- | --- | --- |
| `$eq` | `=` | `{ name: { $eq: 'Jhon' } }`, or: `{ name: 'Jhon' }` |
| `$neq` | `!=` | `{ name: { $neq: 'Dow' } }` |
| `$gt` | `>` | `{ age: { $gt: 20 } }` |
| `$gte` | `>=` | `{ age: { $gte: 20 } }` |
| `$lt` | `<` | `{ age: { $lt: 20 } }` |
| `$lte` | `<=` | `{ age: { $lte: 20 } }` |
| `$like` | `LIKE` | `{ name: { $like: '%hon' } }` |
| `$nlike` | `NOT LIKE` | `{ name: { $nlike: '%oe' } }` |
| `$ilike` | `ILIKE` | `{ name: { $ilike: '%hon' } }` |
| `$nilike` | `NOT ILIKE` | `{ name: { $nilike: '%oe' } }` |
| `$regex` | `~` | `{ name: { $regex: '(b[^b]+)(b[^b]+)' } }` |
| `$nregex` | `!~` | `{ name: { $nregex: '(bar)(beque)' } }` |
| `$in` | `IN` | `{ id: { $in: [1, 2, 3] } }` |
| `$nin` | `NOT IN` | `{ name: { $nin: [4, 5, 6] } }` |
| `$between` | `BETWEEN` | `{ age: { $between: [6, 18] } }` |
| `$nbetween` | `NOT BETWEEN` | `{ age: { $nbetween: [19, 21] } }` |

> **Note:** You are able to achieve SQL `OR` operator with `$or` in your query object.
