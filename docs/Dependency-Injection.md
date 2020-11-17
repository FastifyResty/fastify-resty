# Dependency Injection

## Overview

Dependency injection is a technique whereby one object (or static method) supplies the dependencies 
of another object. A dependency is an object that can be used (a service).

Fastify Resty provides a built-in dependency injection mechanism to inject [Services](./Services.md), 
[Models](./Model.md) or Fastify [Decorated values](https://www.fastify.io/docs/latest/Decorators/) to 
your controllers.

> There is not scope separation included and all the injectables values are stored at the global scope.

> All the injectables values are constructed using Singleton pattern, so the same instance would be 
shared throw all the injects.

## Injectable classes

You are able to create injectable classes decorated with `@Service` decorator to be used 
inside your controllers or each other.

Example of `PostService` which has a method to generate random string:

```ts
import { Service } from '@fastify-resty/core';

@Service()
export default class PostService {
  
  public randomString(): string {
    return Math.random().toString(36).substring(7);
  }

} 
```

## Inject functionality

There are several ways to inject classes. They are working almost the same, so only you decide which 
one to choose from.

### Inject via the class constructor attributes

The most simple way to inject some external class into the current one is to specify it on the class 
constructor with a related type. Make sure here that type needs to be a real physically existing class, 
not an interface or any other abstraction.

```ts
import { Controller, GET } from '@fastify-resty/core';
import PostService from './post.service.ts';

@Controller('/post')
export default class PostController {
  constructor(private _postService: PostService) {}

  @GET('/random')
  getRandomString() {
    const result = this._postService.randomString();
    return { result };
  }
}
```

### Inject via the class property

Another way is to inject some class using `@Inject` decorator provided by **Fastify Resty** core. Let's 
inject the previously created model with it:

```ts
import { Controller, GET, Inject } from '@fastify-resty/core';
import PostModel from './post.model.ts';
import type { FastifyRequest } from 'fastify';

@Controller('/post')
export default class PostController {
  @Inject()
  private _postModel: PostModel;

  @GET('/by-name/:name')
  async getByName(request: FastifyRequest<{ Params: { name: string } }>) {
    const result = await this._postModel.getByName(request.params.name);
    return { result };
  }
}
```

The cool thing here that you are able to inject entries into static properties. The following part 
would work as well:

```ts
@Controller('/post')
export default class PostController {
  @Inject()
  static postModel: PostModel;
}
```

### Inject via tokens

Services could have unique token key to be used for injection. This key needs to be set on `@Service` 
decorator as below:

```ts
import { Service } from '@fastify-resty/core';

@Service('PostServiceToken')
export default PostService {}
```

Then it could be injected with `@Inject` decorator into class constructor:

```ts
import { Controller, Inject } from '@fastify-resty/core';
import PostService from './post.service.ts';

@Controller('/post')
export default class PostController {
  postService: PostService; // declare property to assign in the constructor

  constructor(@Inject('PostServiceToken') postService: PostService) {
    this.postService = postService;
  }
}
```

Or inject using a class property:

```ts
import { Controller, Inject } from '@fastify-resty/core';
import PostService from './post.service.ts';

@Controller('/post')
export default class PostController {
  @Inject('PostServiceToken')
  postService: PostService;
}
```

## Inject model instances

**Fastify Resty** core provides `@Model` decorator which is pretty similar to `@Inject` one, but 
it would create and inject a new base model instance each time for the passed entity.

```ts
import { Service, Model, IBaseModel } from '@fastify-resty/core';
import PostEntity from './post.entity.ts';

@Service()
export default class PostService {
  @Model(PostEntity)
  postModel: IBaseModel<PostEntity>;

  getAllPosts() {
    return this.postModel.find();
  }
}
```

To see more details about models check the [Model](./Model.md) documentation.

## Global injectable tokens

A common case when you need to get access to the global Fastify instance or its decorated value inside 
a controller or service. That's could be achieved with global tokens provided by **Fastify Resty**. You 
are able to inject Fastify instance or any decorated value using `@Inject` decorator. 

```ts
import { Controller, Inject, FastifyToken } from '@fastify-resty/core';
import type { FastifyInstance } from 'fastify';

@Controller('/post')
export default class PostController {
  @Inject(FastifyToken)
  instance: FastifyInstance;
}
```

The same would work for class constructor parameter:

```ts
import { Controller, Inject, FastifyToken } from '@fastify-resty/core';
import type { FastifyInstance } from 'fastify';

@Controller('/post')
export default class PostController {
  constructor(@Inject(FastifyToken) instance: FastifyInstance) {
    console.log(instance);
  }
}
```

One more example of injection for fastify decorated values. Let's imagine that you have decorated your name 
somewhere in the application with `fastify.decorate('username', 'Jhon');`. To get this value inside controller 
`FastifyToken` could be used, but also that's possible to inject this value directly by its name:

```ts
import { Controller, Inject, FastifyToken } from '@fastify-resty/core';
import type { FastifyInstance } from 'fastify';

@Controller('/post')
export default class PostController {
  @Inject('username')
  username: string;
}
```

You could also use `GlobalConfig` token to get the global application configuration with basic controllers and 
model options. Explore available configuration options on [Bootstrapping](./Bootstrapping.md) reference.
