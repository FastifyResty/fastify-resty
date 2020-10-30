import type { RouteOptions } from 'fastify';
import type { JSONSchema7 } from 'json-schema';

type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export interface Constructable<T = any> {
  new(...args): T;
}

export type JSONSchema7Extended = JSONSchema7 & {
  _options?: {
    generated?: boolean;
    nullable?: boolean;
    hidden?: boolean;
  }
};

export interface IRequestSchema {
  body?: JSONSchema7;
  querystring?: JSONSchema7 | Record<string, JSONSchema7>;
  params?: Record<string, JSONSchema7>;
  response?: Record<string | number, JSONSchema7>;
  headers?: Record<string, JSONSchema7>;
}

export type IBaseControllerMethods = 'find'
  | 'findOne'
  | 'create'
  | 'patch'
  | 'patchOne'
  | 'update'
  | 'updateOne'
  | 'remove'
  | 'removeOne'; 

export type IControllerSchemas = {
  [key in IBaseControllerMethods]: IRequestSchema
};

export type IRouteOptions = {
  [key in IBaseControllerMethods]: Partial<RouteOptions>
};

export type Identifier = number | string;

export type ModifyResponse = { affected: number };

export interface IFindResponse<E> {
  data:  E[];
  total?: number;
  limit?: number;
  offset?: number;
}

export interface IFindQuery {
  $limit?:  number;
  $skip?:   number;
  $select?: string[];
  $sort?:   string | string[];
  $where?:  IFindWhereQuery;
}

export interface IFindWhereQuery { // todo specify
  $or?: {
    [key: string]: any;
  };
  [key: string]: any;
}

export interface IBaseModel<E extends object> {
  readonly name: string;

  find   (query?: IFindQuery):              Promise<E[]>;
  total  (options?: IFindQuery):            Promise<number>;
  create (data: E | E[]):                   Promise<{ identifiers: Identifier[] }>;
  patch  (query: IFindWhereQuery, raw: E):  Promise<ModifyResponse>;
  update (query: IFindWhereQuery, raw: E):  Promise<ModifyResponse>;
  remove (query: IFindWhereQuery):          Promise<ModifyResponse>;
}

/*
 * Configuration types
 */

export interface IModelConfig {
  id: string;
  softDelete: boolean;
}

export type IModelOptions = Partial<IModelConfig>;

export interface IPagination {
  limit: number;
  total: boolean;
}

export interface IControllerConfig {
  id: string;
  methods: IBaseControllerMethods[];
  allowMulti: boolean;
  returning: boolean;
  pagination: boolean | IPagination;
}

export type IControllerOptions = Override<Partial<IControllerConfig>, { pagination?: boolean | Partial<IPagination> }>;

export interface ILoaderConfig {
  pattern: RegExp;
  controllers?: Constructable[];
  entry?: string;
}

export type IApplicationConfig = ILoaderConfig & {
  defaults: IControllerConfig & IModelConfig
};

export type IApplicationOptions = Partial<ILoaderConfig> & {
  defaults?: IControllerOptions & IModelOptions
};
