"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
const typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: "postgres",
    host: "syserrepar-pg-devqa-db-01.chbngkghfvhl.us-east-2.rds.amazonaws.com",
    port: 5432,
    username: "dev_user",
    password: "dev",
    database: "pg_dev_01",
    synchronize: true,
    logging: true,
    entities: []
});
