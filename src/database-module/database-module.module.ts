import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { sequelizeConfig } from './../sequelize.config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot(), SequelizeModule.forRoot(sequelizeConfig)],
})
export class DatabaseModule {
  constructor() {}
}
