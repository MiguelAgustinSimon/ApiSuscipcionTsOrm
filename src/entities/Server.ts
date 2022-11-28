import express from 'express';
import { AppDataSource } from "../config/db";
import cors from 'cors';
import  morgan  from "morgan";
//Rutas
import  productRoutes  from "../routes/product.routes";
require('express-async-errors');


class Server {
    private app:express.Application;
    private port:any;
    constructor() {
        this.app = express();
    
        if (process.env.STAGE == "PROD") {
            this.port = process.env.PORT || 8000;
        } else {
            this.port = 3002;
        }
    
        //Connect to database
        this.dbConnection();

        //middlewares
        this.middlewares();

        //App Routes
        this.routes();
    }

    async dbConnection() {
        try {
          //console.log(db);
          await AppDataSource.initialize();
          console.log("Database online");
        } catch (error:any) {
          throw new Error(error);
        }
    }

    
  middlewares() {
    try {
      // CORS
      this.app.use(morgan('dev'));
      this.app.use(cors());
      let router = express.Router();
      
      //SWAGGER
      const swaggerUi = require('swagger-ui-express');
      const swaggerDocument = require('./swagger.json');
      router.use('/api-docs', swaggerUi.serve);
      router.get('/api-docs', swaggerUi.setup(swaggerDocument));
      
      this.app.use("/", router);

      //Body lecture
      this.app.use(express.urlencoded({ extended: false }));
      this.app.use(express.json());
      this.app.use((err:any, req:any, res:any, next:any) => {
        console.error(err);
        res.status(500).send('Something broke!');
    });
    } catch (error) {
      console.log(`Error: ${error}`);
    }
    
  }

    routes() {
        //this.app.use("/api", require("../routes/product.routes"));
        this.app.use('/api',productRoutes);
    }

    listen() {
        this.app.listen(this.port, () => {
            console.log(`Escuchando en puerto ${this.port}`);
        });
      }


}
export default Server;
