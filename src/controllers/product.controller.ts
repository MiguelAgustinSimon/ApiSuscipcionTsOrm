import { Request,Response } from "express";
const UUIDChecker = require("../middlewares/UUIDChecker");
const NullChecker = require("../middlewares/NullChecker");
const {logger}=require("../entities/Logger");
import { Product } from "../entities/Product";
import { Subscriber } from "../entities/Subscriber";
import { Product_Type } from "../entities/Product_Type";
import { Product_Subscription } from "../entities/Product_Subscription";
import { Product_Scope } from "../entities/Product_Scope";
var moment = require('moment'); 
const parseJwt=async (token:string)=>{
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

// ---------------------------------------------------- RUTAS GET--------------------------------------------------------------
const getProducts = async (req:Request,res:Response) => {
    //  const productos= await Product.find();
    //  return res.json(productos);

     //https://www.youtube.com/watch?v=aXP3s7kyRBg&ab_channel=LaughingTechnologies%28OkTests.com%29
     //FIND ORM: https://desarrolloweb.com/articulos/metodo-find-repositorios-typeorm
    try {
        const  pageAsNumber : any = req.query.page;
        const sizeAsNumber:any=req.query.size;
        const unProductID:any=req.query.product_id;
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
            where: { 
                product_id: unProductID
              },
            relations: {
                product_Subscriptions: true,
            },
            take:size,
            skip:pageSize
          
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

const obtenerProductoEspecifico= async (product_code:any) => {
    //sirve para devolver el product_id en getSubscriberSuscriptionCommProduct
    let id=0;
    await Product.findOne({
        where: {product_code} 
      })
    .then( (data:any)=>{
            id=data.dataValues.product_id;
    })
    .catch( (error)=>{
            console.log(`error: ${error}`);
    });
    return id;
}

// Todas las suscripciones por Suscriptor
const getSubscriberSuscriptionCommProduct= async (req:Request,res:Response) => {
    const {subscriber_id}= req.params;
    let pageAsNumber:any=req.query.page;
    let sizeAsNumber:any=req.query.size;
    pageAsNumber=Number.parseInt(pageAsNumber);
    sizeAsNumber=Number.parseInt(sizeAsNumber);

    let where:any={};
    let fechaInicio= req.query.subscription_start_date;
    let fechaFin= req.query.subscription_finish_date;
    let is_active= req.query.is_active;
    let product_id= req.query.product_id;
    let product_code= req.query.product_code;

    let page=0;
    let size=10;

    var validaStartDate = moment(fechaInicio);
    var validaFinishDate = moment(fechaFin);

    if(!subscriber_id){
        logger.warn(`getSubscriberSuscriptionCommProduct: No se ingreso subscriber_id`);
        return res.status(400).json({message: "No se ingreso subscriber_id."})
    }

    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }

    if(subscriber_id){
        where.subscriber_id= {subscriber_id}
    }
    
    if(fechaInicio){
        if(!validaStartDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de inicio invalida`);
            return res.status(400).json({message: "Fecha de inicio invalida"})
        }else{
            if(validaStartDate)
            {
                where.subscription_start_date>= {validaStartDate}
            }
        }
    }
    if(fechaFin){
        if(!validaFinishDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de finalizacion invalida`);
            return res.status(400).json({message: "Fecha de finalizacion invalida"})
        }else{
            if(validaFinishDate)
            {
                where.subscription_finish_date<= {validaFinishDate}
            }
        }
    }

    if(is_active){
        where.is_active= {is_active}
    }
    if(product_id){
        where.product_id= {product_id}
    }
    if(product_code){
        //obtengo el product_id pasandole el product_Code
       await obtenerProductoEspecifico(product_code)
        .then(productoObtenido => {
            where.product_id= {productoObtenido}
        });
    }
    console.log(where);

    const [count]:any = await Product_Subscription.findAndCount({
        take:size,
        skip:page*size,
        where
    })
    res.header('X-Total-Count', count);
    
   await Product_Subscription.find({ 
    take:size,
    skip:page*size,
    relations: {
        product: true,
        product_Scope:true
    },
       where,
       order: {
            product_subscription_id:"ASC",
            product: {product_name: "ASC",}
        }
   })
   .then( (data)=>{
        if (data.length===0) 
        { 
            logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: Datos no encontrados`);
            return res.status(204).json({message: "Datos no encontrados."});
        }
        else{
            logger.info(`ProductScope: getSubscriberSuscriptionCommProduct ok`);
            return res.status(200).json(data);
        }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getSubscriberSuscriptionCommProduct error: ${error.message}`);
       res.json({error:error.message});
   });
}

//Todas las suscripciones por Producto
const getBySuscriptionProductIdCommProduct= async (req:Request,res:Response) => {
    const {product_id}= req.params;

    let is_active= req.query.is_active;
    let where:any={};
    let pageAsNumber:any=req.query.page;
    let sizeAsNumber:any=req.query.size;
    pageAsNumber=Number.parseInt(pageAsNumber);
    sizeAsNumber=Number.parseInt(sizeAsNumber);
    let page=0;
    let size=10;

    if(!product_id){
        logger.warn(`getBySuscriptionProductIdCommProduct: No se ingreso product_id`);
        return res.status(400).json({message: "No se ingreso product_id."})
    }

    if(!UUIDChecker(product_id)){
        logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    //Verificar si existe este producto..
    console.log(`producto ${product_id}`);
    const _product = await Product.findOne(
    {
        
        where: {product_id:product_id}
    })
    if(!_product){
        logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct - Datos no encontrados ${_product}`);
        return res.status(400).json({message: "Datos no encontrados"});
    }

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }

    if(is_active){
        where.is_active= {is_active}
    }

    const [count]:any= await Product.findAndCount({
        take:size,
        skip:page*size,
        where
    })
    res.header('X-Total-Count', count);

   await Product.find({ 
        take:size,
        skip:page*size,
        relations: {
            product_Subscriptions: true,
            product_Scopes:true,
            product_type:true
        },
           where,
           order: {
                product_Subscriptions: {subscriber_id: "ASC", product_subscription_id: "ASC"}
            }
   })
   .then( (data)=>{
       if(data){
            logger.info(`ProductScope: getBySuscriptionProductIdCommProduct ok`);
            return res.status(200).json(data);
       }
       else{
            logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getBySuscriptionProductIdCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}

const getProductCommProduct= async (req:Request,res:Response) => {
    const {product_code}= req.params;
    if(!product_code){
        logger.warn(`getProductCommProduct: No se ingreso product_code`);
        return res.status(400).json({message: "No se ingreso product_code."})
    }

    await Product.findOne({
        relations: {
            product_Scopes:true,
            product_type:true
        },
        where: {product_code} 
      })
   .then( (data)=>{
       if(data){
            logger.info(`ProductScope: getProductCommProduct ok`);
            return res.json(data);
       }
       else{
            logger.warn(`ProductScope: getProductCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
       }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getProductCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Dar de alta un Producto nuevo
const createProductCommProduct = async (req:Request,res:Response) => {
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



module.exports = {
    //Aca exporto los metodos
    getProducts,
    getSubscriberSuscriptionCommProduct,
    getBySuscriptionProductIdCommProduct,
    getProductCommProduct,
    // getAllProductsCommProduct,
    // addSubscriptionCommProduct,
    createProductCommProduct,
    // createProductScopeCommProduct,
    // disableSubscriptionCommProduct,
    // updateProductCommProduct,
    // updateProductScopeCommProduct
  }



