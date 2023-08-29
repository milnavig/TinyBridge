import { Sequelize } from 'sequelize-typescript';
import { Url } from './models/UrlModel';

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    dialect: 'mysql',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT)
  }
);

sequelize.addModels([Url]);

export default sequelize;