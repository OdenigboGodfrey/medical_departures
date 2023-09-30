// import { Model } from 'mongoose';

import { Model, ModelCtor } from 'sequelize-typescript';

export interface BaseInterfaceRepository<T extends Model<T>> {
  create(entityModel: new () => T, data: any): Promise<T>;

  findOneById(entityModel: new () => T, id: number): Promise<T>;

  findByCondition(entityModel: new () => T, filterCondition: any): Promise<T[]>;

  findOneByCondition(
    entityModel: new () => T,
    filterCondition: any,
  ): Promise<T>;

  findAll(entityModel: new () => T): Promise<T[]>;

  remove(entity: Model<T>): Promise<void>;
  getRepo<K extends Model<any, any>>(entityModel: ModelCtor<K>): ModelCtor<K>;

  findOneWhere(entityModel: new () => T, filterCondition: any): Promise<T>;

  findWhere(entityModel: new () => T, filterCondition: any): Promise<T[]>;

  UpdateOne(entity: T, data: any): Promise<T>;

  createBulk(
    entityModel: ModelCtor<T>,
    dto: T[] | any,
  ): Promise<{ inserted: number; data: T[] }>;
  count(entityModel: new () => T, filterCondition: any): Promise<number>;
}
