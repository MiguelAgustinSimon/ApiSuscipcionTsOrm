import { DataSource } from "typeorm";
import { Product } from "./entities/Product";
export const AppDataSource = new DataSource({
    // type: "postgres",
    // host: "syserrepar-pg-devqa-db-01.chbngkghfvhl.us-east-2.rds.amazonaws.com",
    // port: 5432,
    // username: "dev_user",
    // password: "dev",
    // database: "pg_dev_01",
    // synchronize: true,
    // logging: true,
    // entities: [Test]
    type: "postgres",
    host: "127.0.0.1",
    port: 5432,
    username: "postgres",
    password: "1234",
    database: "postgres",
    synchronize: true,
    logging: true,
    entities: [Product]
})