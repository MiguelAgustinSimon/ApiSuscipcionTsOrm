import { Request,Response } from "express";
const {logger}=require("../entities/Logger");

import { Product } from "../entities/Product";

// ---------------------------------------------------- RUTAS GET--------------------------------------------------------------
export const getProducts = async (req:Request,res:Response) => {
     //const productos= await Product.find();
     //return res.json(productos);
    try {

        const  pageAsNumber : any = req.query.page;
        const sizeAsNumber:any=req.query.size;
        let page:number=0;
        let size:number=10;

        if(!Number.isNaN(pageAsNumber) && parseInt(pageAsNumber)>0){
            page=pageAsNumber;
        }

        if(!Number.isNaN(sizeAsNumber) && parseInt(sizeAsNumber)>0 && parseInt(sizeAsNumber)<10){
            size=sizeAsNumber;
        }
        let pageSize=page*size;

        let [productosFiltrados, count] = await Product.findAndCount({
            //Faltaria incluir modeloProductoSuscripcion
            take:size,
            skip:pageSize,
            
        });
        let contador:any=count;
        res.header('X-Total-Count', contador);
        if(productosFiltrados){
            logger.info(`ProductScope: getProducts ok`);
            return res.json(productosFiltrados);
        }
        else{
          logger.warn(`ProductScope: getProducts: No se pudieron obtener productos`);
          return res.json({
              ok:false,
              message:'No se pudieron obtener productos'
          })
        }         
    }
    catch (error) {
        logger.error(`ProductScope: getProducts error: ${error}`);
        res.json({error:error});
    }
}
// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Dar de alta un Producto nuevo
export const createProductCommProduct = async (req:Request,res:Response) => {
    try {
        let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
        
        const { 
            product_code,
            product_name,     
            product_type_id,
            apply_eol,
            apply_ius
          } = req.body;
        
        const producto=new Product();
        producto.product_code=product_code,
        producto.product_name=product_name,   
        producto.product_type_id=product_type_id,
        producto.apply_eol=apply_eol,
        producto.apply_ius=apply_ius

        await producto.save();
        if(producto){
            logger.info(`ProductScope: createProductCommProduct ok`);
            return res.json({ok:true,mensaje:'Producto creado',producto});
        }
        else{
          logger.warn(`ProductScope: createProductCommProduct: El producto no pudo ser creado`);
          return res.json({
              ok:false,
              message:'El producto no pudo ser creado'
          })
        } 
    }
    catch (error) {
        logger.error(`ProductScope: createProductCommProduct: El producto no pudo ser creado ${error}`);
        return res.status(400).json({
            ok:false,
            mensaje:error,
            error:error
        });
    }    
} // fin createProductCommProduct

