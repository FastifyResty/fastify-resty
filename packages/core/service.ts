import 'reflect-metadata';
// import type { Constructable } from '../types'; 

interface Constructable<T = any> {
  new(...args): T;
}

class Injector {

  private diMap = new Map();

  getInstance<T>(constructor: Constructable<T>) : T  {
     const instance = this.constructObject(constructor);
     return instance;
   }

  private constructObject(constructor: Constructable) {
    let currentInstance = this.diMap.get(constructor);
    if (currentInstance) return currentInstance;

    const metaData: Constructable[] = Reflect.getMetadata('design:paramtypes', constructor);

    // We need to init each constructor function into it's instance
    const argumentsInstances = (metaData || []).map((params) => this.constructObject(params));

    currentInstance = new constructor(... argumentsInstances);
    this.diMap.set(constructor, currentInstance);
    return currentInstance;
  }
}

function Service(target) {
  const origin = target;
  return origin;
}

function Model(target) {
  const origin = target;
  return origin;
}

// Sample

@Model
class User {
  name: string;
  age: number;
  getName() {
    return 'Danila';
  }
}

@Model
class Post {
  title: string;
  views: number;
  getViews() {
    return 100;
  }
}

@Service
class UserService {
  constructor(public userModel: User) {}
}

@Service
class PostService {
  constructor(public postModel: Post, public userService: UserService) {}
}

const injector = new Injector();
const injected = injector.getInstance<PostService>(PostService);

console.log(injected.userService.userModel.getName());
