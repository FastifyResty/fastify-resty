# Services

## Purpose

Services were designed to hide a massive business logic and reduce codebase of controllers. 
Service, generally, is a class with bunch of methods that solve some specific problems and 
could be shared with other controllers or services using [Dependency Injection](./Dependency-Injection.md) 
mechanism.

Services could use [Models](./Model.md) to work with actual data, stored in database.

## Creation

To specify class as injectable service we need to decorate it with `@Service()` provided by 
**Fastify Resty** core functionality.

```ts
import { Service } from '@fastify-resty/core';

@Service()
export default class CalculatorService {
  sum(a: number, b: number): number {
    return a + b;
  }

  multiply(a: number, b: number): number {
    return a * b;
  }
}
```

As a single optional argument, the service token could be passed. The token is used to inject 
the service into other classes with `@Inject(token)` signature. Token must be of `string` or `symbol` type.

Define token string:

```ts
@Service('MyServiceToken')
```

Define token symbol:

```ts
const MyServiceToken = Symbol('MyServiceToken');

@Service(MyServiceToken)
```

### Usage

The most common case is a controller-specific service which needs to be injected into it.

##### Service (sample.service.ts):

```ts
import { Service } from '@fastify-resty/core';

@Service()
export default class SampleService {
  sayHi(name: string): string {
    return `Hey, ${name}`;
  }
}
```

##### Controller (sample.controller.ts):

```ts
import { Controller, GET } from '@fastify-resty/core';
import SampleService from './sample.service.ts';

@Controller('/sample')
export default class SampleController {
  constructor(private _sampleService: SampleService) {}

  @GET('/say/hi/:name')
  getSayHi(request) {
    return _sampleService.sayHi(request.params.name);
  }
}
```

See more service inject ways on [Dependency Injection](./Dependency-Injection.md) documentation.
