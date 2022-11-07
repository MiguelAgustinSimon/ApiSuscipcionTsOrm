import { DataSource } from "typeorm";
import { Product } from "../entities/Product";
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "syserrepar-pg-devqa-db-01.chbngkghfvhl.us-east-2.rds.amazonaws.com",
    port: 5432,
    username: "dev_user",
    password: "dev",
    database: "pg_dev_01",
    synchronize: true,
    logging: false,
    entities: [Product]
    // type: "postgres",
    // host:  process.env.POSTGRESQL_HOST,
    // port: 5432,
    // username: process.env.POSTGRESQL_USER,
    // password: process.env.POSTGRESQL_PASS,
    // database: process.env.POSTGRESQL_NAME,
    // synchronize: true,
    // logging: true
});