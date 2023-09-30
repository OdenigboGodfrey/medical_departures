import * as dotenv from 'dotenv';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { User } from './modules/user/entities/user.entity';
import { Blog } from './modules/blog/entities/blog.entity';
dotenv.config();
export const sequelizeConfig: SequelizeOptions = {
  dialect: 'mysql',
  host:
    process.env.NODE_ENV == 'development'
      ? process.env.PG_HOST
      : process.env.RDS_HOSTNAME,
  port:
    process.env.NODE_ENV == 'development'
      ? process.env.PG_PORT
        ? parseInt(process.env.PG_PORT)
        : 3306
      : parseInt(process.env.RDS_PORT),
  username:
    process.env.NODE_ENV == 'development'
      ? process.env.PG_USERNAME
      : process.env.RDS_USERNAME,
  password:
    process.env.NODE_ENV == 'development'
      ? process.env.PG_PASSWORD
      : process.env.RDS_PASSWORD,
  database:
    process.env.NODE_ENV == 'development'
      ? process.env.PG_DATABASENAME
      : process.env.RDS_SID,
  models: [User, Blog], // Add all your model classes here
  logging: console.log,
};
export const sequelize = new Sequelize(sequelizeConfig);
