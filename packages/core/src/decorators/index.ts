export * from './controller';
export * from './entityController';
export * from './requestMethods';
export * from './hooks';
export * from './model';

export function Service<T>(target: T): T {
  const origin = target;
  return origin;
}