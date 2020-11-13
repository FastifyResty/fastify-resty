import { BaseModel } from './BaseModel';

export function bootstrap(instance, { connection }, done) {
  BaseModel.connection = connection;

  instance.decorate('connection', connection);
  instance.decorate('BaseModel', BaseModel);

  done();
}

bootstrap[Symbol.for('skip-override')] = true;
