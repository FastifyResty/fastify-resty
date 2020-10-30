import { Model } from './Model';

export function bootstrap(instance, { connection }, done) {
  Model.connection = connection;

  instance.decorate('connection', connection);
  instance.decorate('Model', Model);

  done();
}

bootstrap[Symbol.for('skip-override')] = true;
