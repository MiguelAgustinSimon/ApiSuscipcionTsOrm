import { DataSource } from "typeorm";
import { Product } from "../entities/Product";
import { Subscriber } from "../entities/Subscriber";
import { Product_Type } from "../entities/Product_Type";
import { Product_Subscription } from "../entities/Product_Subscription";
import { Product_Scope } from "../entities/Product_Scope";
require("dotenv").config({path:"./.env"});

export const AppDataSource = new DataSource({
    // type: "postgres",
    // host: "syserrepar-pg-devqa-db-01.chbngkghfvhl.us-east-2.rds.amazonaws.com",
    // port: 5432,
    // username: "dev_user",
    // password: "dev",
    // database: "pg_dev_01",
    // schema:"comm_prod",
    // synchronize: false,
    // logging: true,
    // entities: [Product,Subscriber,Product_Type,Product_Subscription,Product_Scope]
    type: "postgres",
    host:  process.env.POSTGRESQL_HOST,
    port: 5432,
    username: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASS,
    database: process.env.POSTGRESQL_NAME,
    synchronize: false,
    logging: false,
    entities: [Product,Subscriber,Product_Type,Product_Subscription,Product_Scope]

    
});

console.log(AppDataSource.options)