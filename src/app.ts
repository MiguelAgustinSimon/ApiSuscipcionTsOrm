import express from 'express';
import  morgan  from "morgan";
import  cors  from "cors";
//Rutas
import  productRoutes  from "./routes/product.routes";


const app= express();
app.use(morgan('dev'));
app.use(cors());

app.use(express.json());
app.use(productRoutes);
export default app;