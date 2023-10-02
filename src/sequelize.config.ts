import * as dotenv from 'dotenv';
import { Sequelize, SequelizeOptions } from 'sequelize-typescript';
import { User } from './modules/user/entities/user.entity';
import { Blog } from './modules/blog/entities/blog.entity';
dotenv.config();
let sequelizeConfig: SequelizeOptions;
(() => {
  console.log('running');
  sequelizeConfig = {
    dialect: 'mysql',
    host:
      process.env.NODE_ENV == 'development'
        ? process.env.PG_HOST
        : 'db.cuihe12zvuil.eu-west-1.rds.amazonaws.com',
    port:
      process.env.NODE_ENV == 'development'
        ? process.env.PG_PORT
          ? parseInt(process.env.PG_PORT)
          : 3306
        : parseInt(process.env.RDS_PORT),
    username:
      process.env.NODE_ENV == 'development'
        ? process.env.PG_USERNAME
        : 'bLog_User',
    password:
      process.env.NODE_ENV == 'development'
        ? process.env.PG_PASSWORD
        : 'BLogPaSSwORd_12345',
    database:
      process.env.NODE_ENV == 'development'
        ? process.env.PG_DATABASENAME
        : 'db',
    models: [User, Blog],
    logging: console.log,
  };
  console.log(
    'process.env.NODE_ENV',
    process.env.NODE_ENV,
    sequelizeConfig.host,
    process.env.NODE_ENV == 'development',
    process.env.PG_HOST,
    process.env.NODE_ENV == 'development'
      ? process.env.PG_HOST
      : 'db.cuihe12zvuil.eu-west-1.rds.amazonaws.com',
  );
})();

export async function runMigration() {
  try {
    await sequelize.sync(); // Run migrations
    console.log('Migrations executed successfully');
    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1); // Exit with an error code to indicate migration failure
  }
  return false;
}

const sequelize = new Sequelize(sequelizeConfig);
console.log('process env', process.env.NODE_ENV, sequelize.config.host);
export { sequelize, sequelizeConfig };
