/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { Model, ModelCtor } from 'sequelize-typescript';
import { BaseInterfaceRepository } from './base.interface.repository';
// import { Model } from 'sequelize';

@Injectable()
export class BaseAbstractRepository<T extends Model<T>>
  implements BaseInterfaceRepository<T>
{
  constructor() {}
  async count(entityModel: new () => T, filterCondition: any): Promise<number> {
    const result = await entityModel['count']({ where: filterCondition });
    return result;
  }
  findByCondition(
    entityModel: new () => T,
    filterCondition: any,
  ): Promise<T[]> {
    return entityModel['findAll']({
      where: filterCondition,
    }) as Promise<T[] | null>;
  }
  findOneByCondition(
    entityModel: new () => T,
    filterCondition: any,
  ): Promise<T> {
    return entityModel['findOne']({
      where: filterCondition,
    }) as Promise<T | null>;
  }
  findAll(entityModel: new () => T): Promise<T[]> {
    return entityModel['findAll']() as Promise<T[] | null>;
  }
  getRepo<K extends Model<any, any>>(entityModel: ModelCtor<K>): ModelCtor<K> {
    return entityModel;
  }

  findOneWhere(entityModel: new () => T, filterCondition: any): Promise<T> {
    return entityModel['findOne']({
      where: filterCondition,
    }) as Promise<T | null>;
  }
  findWhere(entityModel: new () => T, filterCondition: any): Promise<T[]> {
    return entityModel['findAll']({
      where: filterCondition,
    }) as Promise<T[] | null>;
  }

  async createBulk(
    entityModel: ModelCtor<T>,
    dto: any,
  ): Promise<{ inserted: number; data: T[] }> {
    const entity = this.getRepo(entityModel);
    const insertedData = await entity.bulkCreate(dto);
    return { inserted: insertedData.length, data: insertedData };
  }

  async create(entityModel: new () => T, data: any): Promise<T> {
    const entity = new entityModel();
    Object.assign(entity, data);
    return entity.save();
  }

  async findOneById(entityModel: new () => T, id: number): Promise<T | null> {
    return entityModel['findByPk'](id) as Promise<T | null>;
  }

  async UpdateOne(entity: T, data: any): Promise<T> {
    Object.assign(entity, data);
    await entity.save();
    return entity;
  }

  async remove(entity: Model<T>): Promise<void> {
    await entity.destroy();
  }
}
