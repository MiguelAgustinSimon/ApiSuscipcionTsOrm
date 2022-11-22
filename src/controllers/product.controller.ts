import { Request,Response } from "express";
const UUIDChecker = require("../middlewares/UUIDChecker");
const NullChecker = require("../middlewares/NullChecker");
const {logger}=require("../entities/Logger");
import { Product } from "../entities/Product";
import { Subscriber } from "../entities/Subscriber";
import { Product_Type } from "../entities/Product_Type";
import { Product_Subscription } from "../entities/Product_Subscription";
import { Product_Scope } from "../entities/Product_Scope";
import { LessThan, MoreThan } from "typeorm";
import ProductService from '../service/product.service';
import BaseException from "../exceptions/BaseException";

var moment = require('moment'); 

const parseJwt=async (token:string)=>{
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
}

let _productService=new ProductService();

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

        //llamo al Service
        const resultado = await _productService.getProducts(unProductID,page,size);

        if(resultado.length>0){
            let contador:any=resultado.length;
            res.header('X-Total-Count', contador);
            logger.info(`ProductScope: getProducts ok`);
            return res.json(resultado);
        }
        else{
            logger.warn(`ProductScope: getProducts: No se pudieron obtener productos`);
            throw new BaseException("No se pudieron obtener productos.",404,"ProductScope: getProducts");
        }         
    }
    catch (error) {
        logger.error(`ProductScope: getProducts error: ${error}`);
        res.json({error:error});
    }
}

// Todas las suscripciones por Suscriptor
const getSubscriberSuscriptionCommProduct= async (req:Request,res:Response) => {
    try {
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
        throw new BaseException("No se ingreso subscriber_id.",400,"ProductScope: getSubscriberSuscriptionCommProduct");
        //return res.status(400).json({message: "No se ingreso subscriber_id."})
    }

    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        throw new BaseException("Ingrese un UUID valido.",400,"ProductScope: getSubscriberSuscriptionCommProduct");
    }
    

    if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
        page=pageAsNumber;
    }

    if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
        size=sizeAsNumber;
    }

    if(subscriber_id){
        where.subscriber_id= subscriber_id
    }
    
    if(fechaInicio){
        if(!validaStartDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de inicio invalida`);
            throw new BaseException("Fecha de inicio invalida.",400,"ProductScope: getSubscriberSuscriptionCommProduct");

        }else{
            if(validaStartDate)
            {
                //where.subscription_start_date>=validaStartDate
                where.subscription_start_date=MoreThan(validaStartDate)
            }
        }
    }
    if(fechaFin){
        if(!validaFinishDate.isValid()){
            logger.warn(`getSubscriberSuscriptionCommProduct: Fecha de finalizacion invalida`);
            throw new BaseException("Fecha de finalizacion invalida.",400,"ProductScope: getSubscriberSuscriptionCommProduct");

        }else{
            if(validaFinishDate)
            {
                where.subscription_finish_date=LessThan(validaFinishDate)
            }
        }
    }

    if(is_active){
        where.is_active= is_active
    }
    if(product_id){
        where.product_id= product_id
    }
    else{
        if(product_code){
            //obtengo el product_id pasandole el product_Code
        let productoObtenido= await _productService.obtenerProductoEspecifico(product_code);
            if(UUIDChecker(productoObtenido)){
                where.product_id= productoObtenido
            }
        }
    }

     //llamo al Service
     const resultado = await _productService.getSubscriberSuscriptionCommProduct(where,page,size);

     if(resultado.length>0){
        let contador:any=resultado.length;
        res.header('X-Total-Count', contador);
        logger.info(`ProductScope: getSubscriberSuscriptionCommProduct ok`);
        return res.json(resultado);
    }
    else{
        let mensaje="Datos no encontrados";
        logger.warn(`ProductScope: getSubscriberSuscriptionCommProduct: ${mensaje}`);
        throw new BaseException(`${mensaje}`,204,"ProductScope: getSubscriberSuscriptionCommProduct");
    } 
    } catch (error) {
        logger.error(`ProductScope: getProducts error: ${error}`);
        res.json({error:error});
    }
  
}

//Todas las suscripciones por Producto
const getBySuscriptionProductIdCommProduct= async (req:Request,res:Response) => {
    try{
        const {product_id}= req.params;
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

        //llamo al Service
        const _product = await _productService.consultarExistenciaProducto(product_id);

        if(_product==0){
            logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct - Datos no encontrados ${_product}`);
            throw new BaseException("Datos no encontrados.",400,"ProductScope: getBySuscriptionProductIdCommProduct");
        }


        if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
            page=pageAsNumber;
        }

        if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
            size=sizeAsNumber;
        }

        //llamo al Service
        const resultado = await _productService.getBySuscriptionProductIdCommProduct(where,page,size);

        if(resultado.length>0){
            let contador:any=resultado.length;
            res.header('X-Total-Count', contador);
            logger.info(`ProductScope: getBySuscriptionProductIdCommProduct ok`);
            return res.json(resultado);
        }
        else{
            let mensaje="Datos no encontrados";
            logger.warn(`ProductScope: getBySuscriptionProductIdCommProduct: ${mensaje}`);
            throw new BaseException(`${mensaje}`,404,"ProductScope: getBySuscriptionProductIdCommProduct");
        }
    } catch (error) {
        logger.error(`ProductScope: getProducts error: ${error}`);
        res.json({error:error});
    } 
}

//Traer producto especifico por codProd ERP
const getProductCommProduct= async (req:Request,res:Response) => {
    try {
        const {product_code}= req.params;
        if(!product_code){
            logger.warn(`getProductCommProduct: No se ingreso product_code`);
            throw new BaseException(`No se ingreso product_code`,400,"ProductScope: getProductCommProduct");

        }
        //llamo al Service
        const resultado = await _productService.getProductCommProduct(product_code);

        if(resultado.length>0){
            let contador:any=resultado.length;
            res.header('X-Total-Count', contador);
            logger.info(`ProductScope: getProductCommProduct ok`);
            return res.json(resultado);
        }
        else{
            let mensaje="Datos no encontrados";
            logger.warn(`ProductScope: getProductCommProduct: ${mensaje}`);
            throw new BaseException(`${mensaje}`,404,"ProductScope: getProductCommProduct");
        }
    
    } catch (error) {
        logger.error(`ProductScope: getProducts error: ${error}`);
        throw new BaseException(`${error}`,404,"ProductScope: getProductCommProduct");

    }
}

//Lista de Productos por tipo 
const getAllProductsCommProduct= async (req:Request,res:Response) => {
    try{
        let pageAsNumber:any=req.query.page;
        let sizeAsNumber:any=req.query.size;
        pageAsNumber=Number.parseInt(pageAsNumber);
        sizeAsNumber=Number.parseInt(sizeAsNumber);
        let page=0;
        let size=10;

        let where:any={};

        let product_type_id:any= (req.query.product_type_id)?.toString();
        let _product_type_code:any= req.query.product_type_code;
        let apply_eol:any= req.query.apply_eol;
        let apply_ius:any= req.query.apply_ius;

        if(!Number.isNaN(pageAsNumber)&& pageAsNumber>0){
            page=pageAsNumber;
        }

        if(!Number.isNaN(sizeAsNumber) && sizeAsNumber>0 && sizeAsNumber<10){
            size=sizeAsNumber;
        }

        if(_product_type_code)
        {
            const ptc = await Product_Type.findOne({
                where:{product_type_code:_product_type_code}
            })
            if(ptc){
                product_type_id=ptc.product_type_id
            }
        }
        //https://www.tutorialspoint.com/typeorm/typeorm_tutorial.pdf
        if(product_type_id){
            where.product_type_id= product_type_id
        }
        if(apply_eol){
            where.apply_eol= apply_eol
        }
        if(apply_ius){
            where.apply_ius= apply_ius
        }
        //llamo al Service
        const resultado = await _productService.getAllProductsCommProduct(where,page,size);

        if(resultado.length>0){
            let contador:any=resultado.length;
            res.header('X-Total-Count', contador);
            logger.info(`ProductScope: getAllProductsCommProduct ok`);
            return res.json(resultado);
        }
        else{
            let mensaje="Datos no encontrados";
            logger.warn(`ProductScope: getAllProductsCommProduct: ${mensaje}`);
            throw new BaseException(`${mensaje}`,404,"ProductScope: getAllProductsCommProduct");
        }
    
    } catch (error) {
        logger.error(`ProductScope: getAllProductsCommProduct error: ${error}`);
        throw new BaseException(`${error}`,404,"ProductScope: getAllProductsCommProduct");

    }
}


// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Alta de Producto-Suscripcion
const addSubscriptionCommProduct = async (req:Request,res:Response) => { 
    try{
        let { 
            subscriber_id,
            product_id,
            subscription_start_date,     
            subscription_finish_date,
            account_executive_ref_id,
            creation_user
          } = req.body;
        
        let req2:any=await parseJwt(req.token!); 
    
        let fechaHoy = moment();  
        var validaStartDate = moment(subscription_start_date);
        var validaFinishDate = moment(subscription_finish_date);
    
        if(!UUIDChecker(subscriber_id)){
            logger.warn(`ProductScope: addSubscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
            throw new BaseException(`Ingrese un UUID valido`,400,"ProductScope: addSubscriptionCommProduct");
        }
        if(!UUIDChecker(product_id)){
            logger.warn(`ProductScope: addSubscriptionCommProduct: Ingrese un UUID valido: ${product_id}`);
            throw new BaseException(`Ingrese un UUID valido`,400,"ProductScope: addSubscriptionCommProduct");
    
        }
    
        //verifico si existe el suscriptor
        const suscriptor = await Subscriber.find({where: {subscriber_id}});
        //verifico si existe el producto
        const producto = await Product.find({where: {product_id}});
    
        if(!suscriptor){
          logger.warn(`addSubscriptionCommProduct: Suscriptor no existente: ${suscriptor}`);
          throw new BaseException(`Suscriptor no existente`,400,"ProductScope: addSubscriptionCommProduct");
        }
    
        if(!product_id || !producto){
            logger.warn(`addSubscriptionCommProduct: No se ingreso product_id`);
            throw new BaseException(`No se ingreso producto para el suscriptor o este es inexistente`,400,"ProductScope: addSubscriptionCommProduct");
        }
        if(!validaStartDate.isValid() ){//|| validaStartDate>=fechaHoy){ preguntar que hacemos con esto
            logger.warn(`addSubscriptionCommProduct: Fecha de inicio de suscripcion invalida`);
            throw new BaseException(`Fecha de inicio de suscripcion invalida`,400,"ProductScope: addSubscriptionCommProduct");
            
        }
        if(!validaFinishDate.isValid()){
            logger.warn(`addSubscriptionCommProduct: Fecha de finalizacion de suscripcion invalida`);
            throw new BaseException(`Fecha de finalizacion de suscripcion invalida`,400,"ProductScope: addSubscriptionCommProduct");
            
        }
        if(validaStartDate>validaFinishDate){
            logger.warn(`addSubscriptionCommProduct: Fecha de inicio mayor a la fecha de fin`);
            throw new BaseException(`Fecha de inicio mayor a la fecha de fin`,400,"ProductScope: addSubscriptionCommProduct");
    
        }
    
            if(!account_executive_ref_id){
                account_executive_ref_id=0;
            }
    
            //Verificamos si la relacion ya existe
            const existeSuscripcion= await _productService.verificarExistenciaSuscripcion(subscriber_id,product_id);
            //Si ya existe devolvemos el resultado
            if(existeSuscripcion){
                logger.warn(`addSubscriptionCommProduct: Ya existe una suscripción para el producto y suscriptor informados: ${subscriber_id} - ${product_id}`);
                throw new BaseException(`Ya existe una suscripción para el producto y suscriptor informados.`,200,"ProductScope: addSubscriptionCommProduct");
            }
    
              //que la fecha que ingresan no sea menor a la de hoy, ver: https://desarrolladores.me/2020/03/manipular-fechas-con-moment-js/
            const nuevoProductSubscription = await _productService.addSubscriptionCommProduct(subscriber_id,product_id,validaStartDate,validaFinishDate,account_executive_ref_id,fechaHoy,req2.idpData.email);
        
            if(nuevoProductSubscription){
                logger.info(`ProductScope: addSubscriptionCommProduct ok`);
                return res.json({ok:true,mensaje:'Item creado',nuevoProductSubscription});
            }
            else{
                var mensaje="El Item no pudo ser creado.";
                logger.warn(`ProductScope: addSubscriptionCommProduct: ${mensaje}`);
                throw new BaseException(`${mensaje}`,400,"ProductScope: addSubscriptionCommProduct");
            } 
        
   
    }
    catch (error) {
        logger.error(`ProductScope: addSubscriptionCommProduct error: ${error}`);
        res.json({error:error});
    } 
} // fin addSubscriptionCommProduct


//Dar de alta un Producto nuevo
const createProductCommProduct = async (req:Request,res:Response) => {
    try {       
        const { 
            product_code,
            product_name,     
            product_type_code,
            apply_eol,
            apply_ius,
            creation_date
        } = req.body;
        
        //verifico si existe el producto
        const existeProducto = await Product.findOne({where: {product_code}});

        if(existeProducto){
            logger.warn(`ProductScope: createProductCommProduct - Producto ya existente ${product_code}`);
            return res.status(200).json({message: "Producto ya existente"});
        }

        //Verificar si existe un ProductType con product_type_code informado
        const _productType:Product_Type = await _productService.verificarExistenciaProductType(product_type_code);
    
        if(!_productType){
            logger.warn(`ProductScope: createProductCommProduct - product type code inexistente ${product_type_code}`);
            throw new BaseException(`product type code inexistente`,400,"ProductScope: createProductCommProduct");

        }

        if(!apply_eol || !apply_ius){
            logger.warn(`ProductScope: createProductCommProduct - apply_eol/apply_ius no informado`);
            throw new BaseException(`apply_eol/apply_ius no informado`,400,"ProductScope: createProductCommProduct");
        }


        const producto = await _productService.createProductCommProduct(product_code,product_name,_productType.product_type_id,apply_eol,apply_ius);
        if(producto){
            logger.info(`ProductScope: createProductCommProduct ok`);
            return res.json({ok:true,mensaje:'Producto creado',producto});
        }
        else{
            logger.warn(`ProductScope: createProductCommProduct: El producto no pudo ser creado`);
            throw new BaseException(`El producto no pudo ser creado`,400,"ProductScope: createProductCommProduct");

        } 
    }
    catch (error) {
        logger.error(`ProductScope: createProductCommProduct: El producto no pudo ser creado ${error}`);
        throw new BaseException(`El producto no pudo ser creado: ${error}`,400,"ProductScope: createProductCommProduct");

    }    
} // fin createProductCommProduct

//Dar de alta un Product Scope nuevo
const createProductScopeCommProduct = async (req:Request,res:Response) => {
    try {
        const  { 
            product_id,
            product_max_access_count,     
            product_max_user_count,
            scope_finish_date
        } = req.body;
        var validaFinishDate = moment(scope_finish_date);

      //Verificar si existe este producto..
        const _producto = await Product.find({where: {product_id}})
        .then(_producto=>{
            if(!_producto){
                throw new BaseException(`Producto no encontrado`,400,"ProductScope: createProductScopeCommProduct");
            }
        }).catch((err) => res.status(404).json({message: "Producto no encontrado"}));

        
        if(!validaFinishDate.isValid()){
            logger.warn(`createProductScopeCommProduct: Fecha de finalizacion invalida`);
            throw new BaseException(`Fecha de finalizacion invalida`,400,"ProductScope: createProductScopeCommProduct");
        }

        //Verificar si ya existe un alcance activo para el producto
        const _productScope = await _productService.verificarExistenciaProductScope(product_id);
        //console.log(_productScope);
        if(_productScope){
            logger.warn(`ProductScope: createProductScopeCommProduct - Ya existe un alcance de producto activo para el id producto informado ${product_id}`);
            throw new BaseException("Ya existe un alcance de producto activo para el id producto informado",200,"ProductScope: createProductScopeCommProduct");
        }
        
        const prodScope=await _productService.createProductScopeCommProduct(product_id,product_max_access_count,product_max_user_count,validaFinishDate);
        if(prodScope){
            logger.info(`ProductScope: createProductScopeCommProduct ok`);
            return res.status(201).json({ok:true,mensaje:'Alcance de Producto creado',prodScope});
        }
        else{
            logger.warn(`ProductScope: createProductScopeCommProduct: El Item no pudo ser creado`);
            throw new BaseException(`El Item no pudo ser creado`,400,"ProductScope: createProductScopeCommProduct");
        }
        
    }catch (error) {
            logger.error(`ProductScope: addSubscriptionCommProduct error: ${error}`);
            res.json({error:error});
        }   
 
} // fin createProductScopeCommProduct


// ---------------------------------------------------- RUTAS PUT--------------------------------------------------------------

//Desactivar una Suscripcion
const disableSubscriptionCommProduct = async (req:Request,res:Response) => {
    try{
    const {subscriber_id,product_id}=req.params;
    let req2=await parseJwt(req.token); 

    let fechaHoy = moment();  
    if(!product_id || !subscriber_id){
        logger.warn(`disableSubscriptionCommProduct: No se ingreso product_id y/o subscriber_id`);
        return res.status(400).json({message: "No se ingreso product_id y/o subscriber_id."})
    }

    if(NullChecker(subscriber_id, product_id)){
        logger.warn(`ProductScope: disableSubscriptionCommProduct: Peticion invalida`);
        return res.status(400).json({message: 'Peticion invalida'});
    }
    if(!UUIDChecker(subscriber_id)){
        logger.warn(`ProductScope: disableSubscriptionCommProduct: Ingrese un UUID valido: ${subscriber_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    await Product_Subscription.findOne({
       where:{subscriber_id:subscriber_id, product_id:product_id, is_active:true}
    }).then(async modeloProductoSuscripcion=>{
        if(modeloProductoSuscripcion){
            modeloProductoSuscripcion.is_active=false,
            modeloProductoSuscripcion.modification_date=fechaHoy,
            modeloProductoSuscripcion.modification_user=req2.idpData.email
                await Product_Subscription.update({product_subscription_id:modeloProductoSuscripcion.product_subscription_id}, modeloProductoSuscripcion)
                .then(async resultado=>{
                    logger.info(`ProductScope: disableSubscriptionCommProduct ok`);
                        if(resultado.affected!>0){
                            const _ps = await Product_Subscription.findOne({
                                    where:{subscriber_id:subscriber_id, product_id:product_id}
                            })
                            if(_ps){
                                return res.status(201).json({
                                    //ok:true,
                                    message:'Producto actualizado exitosamente',
                                    result:_ps
                                });
                            }
                        }
                        else{
                            logger.warn(`ProductScope: disableSubscriptionCommProduct: La suscripcion no pudo ser modificada`);
                            return res.status(400).json({
                                ok:false,
                                message:'La suscripcion no pudo ser modificada'
                            })
                        }
                }).catch(error=>{
                    logger.error(`ProductScope: disableSubscriptionCommProduct error: ${error.message}`);
                    return res.status(404).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                });           
        }
        else{
            logger.warn(`ProductScope: disableSubscriptionCommProduct: Suscripcion no encontrada`);
            return res.status(400).json({
                ok:false,
                message:'Suscripcion no encontrada'
            });
        }
    }).catch(error=>{
            logger.error(`ProductScope: disableSubscriptionCommProduct error: ${error.message}`);
            res.status(404).json({
                ok:false,
                mensaje:error.message,
                error:error.message,
            });
        }); 
    }
    catch (error) {
        logger.error(`ProductScope: disableSubscriptionCommProduct error: ${error}`);
        return res.status(400).json({
            ok:false,
            mensaje:error,
            error:error
        });
    }
} // fin disableSubscriptionCommProduct

//Modificar los datos un producto en la tabla product.
const updateProductCommProduct = async (req:Request,res:Response) => {
    try 
    {
        const {product}=req.params;
        const {
            product_code,
            product_id,
            product_name,
            product_type_code,
            apply_eol,
            apply_ius
        } = req.body;
        
        let where:any={};
    
        if(!product){
            logger.warn(`updateProductCommProduct: No se ingreso el producto`);
            return res.status(400).json({message: "No se ingreso el producto."})
        }
    
        if(NullChecker(product)){
            logger.warn(`ProductScope: updateProductCommProduct: Peticion invalida`);
            return res.status(400).json({message: 'Peticion invalida'});
        }

        if(!UUIDChecker(product)){
            where.product_code= product;
        }
        else{
            where.product_id= product
        }    
    
        //Verificar si existe un producto con el id de producto informado
        const _product = await Product.findOne({where})
        if(!_product){
            logger.warn(`ProductScope: updateProductCommProduct - No existe el producto con el id de producto informado ${product}`);
            return res.status(400).json({message: "No existe el producto con el id de producto informado"});
        }
    
          //Verificar si existe un ProductType con product_type_code informado
            const _productType = await Product_Type.findOne(
            {
                where: {product_type_code}
            })
            if(!_productType){
                logger.warn(`ProductScope: updateProductCommProduct - product type code inexistente ${product_type_code}`);
                return res.status(400).json({message: "product type code inexistente"});
            }
        
            let fechaHoy= moment();
            await Product.findOne({
                where
            }).then(async modeloProducto=>{
                if(modeloProducto){
                    //console.log(modeloProducto);
                    modeloProducto.product_code=product_code,
                    modeloProducto.product_name=product_name,
                    modeloProducto.product_type_id=_productType.product_type_id,
                    modeloProducto.apply_eol=apply_eol,
                    modeloProducto.apply_ius=apply_ius,
                    modeloProducto.modification_date=fechaHoy;
                    
                    await Product.update({product_id:modeloProducto.product_id},modeloProducto)
                    .then(async resultado=>{
                        logger.info(`ProductScope: updateProductCommProduct ok`);
                        if(resultado.affected!>0){
                            const _p = await Product.findOne({
                                    where:{product_id:modeloProducto.product_id}
                            })
                            if(_p){
                                return res.status(201).json({
                                    //ok:true,
                                    message:'Producto actualizado exitosamente',
                                    result:_p
                                });
                            }
                        }
                        else{
                            logger.warn(`ProductScope: updateProductCommProduct: El Producto no pudo ser modificado`);
                            return res.status(400).json({
                                ok:false,
                                message:'El Producto no pudo ser modificado'
                            })
                        }
                    }).catch(error=>{
                        logger.error(`ProductScope: updateProductCommProduct error: ${error.message}`);
                        return res.status(404).json({
                            ok:false,
                            mensaje:error.message,
                            error:error.message,
                        });
                    }); 
                }
                else{
                    logger.warn(`ProductScope: updateProductCommProduct: Producto no encontrado`);
                    return res.status(400).json({
                        ok:false,
                        message:'Producto no encontrado'
                    });
                }
            }).catch(error=>{
                    logger.error(`ProductScope: updateProductCommProduct error: ${error.message}`);
                    res.status(404).json({
                        ok:false,
                        mensaje:error.message,
                        error:error.message,
                    });
                }); 
    }catch (error) {
        logger.error(`ProductScope: updateProductCommProduct error: ${error}`);
        res.status(404).json({
            ok:false,
            mensaje:"Ha ocurrido un error, asegurese de ingresar los campos correspondientes",
            error
        });
    }        
} // fin updateProductCommProduct

//Modificar Product Scope 
const updateProductScopeCommProduct = async (req:Request,res:Response) => {
    const {product_scope_id}=req.params;
    let fechaHoy= moment();
    const {
        product_id,
        product_max_access_count,
        product_max_user_count,
        scope_start_date,
        scope_finish_date,
        is_active
    } = req.body;

    if(!product_scope_id){
        logger.warn(`updateProductScopeCommProduct: No se ingreso el product_scope_id`);
        return res.status(400).json({message: "No se ingreso el product_scope_id."})
    }
    if(!UUIDChecker(product_scope_id)){
        logger.warn(`ProductScope: updateProductScopeCommProduct: Ingrese un UUID valido: ${product_scope_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
 
    var validaStartDate = moment(scope_start_date);
    var validaFinishDate = moment(scope_finish_date);
    if(!validaStartDate.isValid() || validaStartDate>=fechaHoy){
        logger.warn(`updateProductScopeCommProduct: Fecha de inicio invalida`);
        return res.status(400).json({message: "Fecha de inicio invalida"})
    }
    if(!validaFinishDate.isValid() || validaFinishDate<=fechaHoy){
        logger.warn(`updateProductScopeCommProduct: Fecha de finalizacion invalida`);
        return res.status(400).json({message: "Fecha de finalizacion invalida"})
    }

    if(!is_active){
        return res.status(400).json({message: "El campo is_active no fue informado"})
    }

    await Product_Scope.findOne({
        where:{product_scope_id: product_scope_id}
    }).then(async scope=>{
        if(scope){
            scope.product_id=product_id,
            scope.product_max_access_count=product_max_access_count,   
            scope.product_max_user_count=product_max_user_count,
            scope.scope_start_date=validaFinishDate,
            scope.scope_finish_date=validaFinishDate,
            scope.is_active=is_active,
            scope.modification_date=fechaHoy    
            await Product_Scope.update({product_scope_id: product_scope_id},scope)
            .then(async resultado=>{
                logger.info(`ProductScope: updateProductScopeCommProduct ok`);
                if(resultado.affected!>0){
                    const _p = await Product_Scope.findOne({
                        where:{product_scope_id: scope.product_scope_id}
                    })
                    if(_p){
                        return res.status(201).json({
                            //ok:true,
                            message:'Alcance de Producto modificado',
                            prodScope:_p
                        });
                    }
                }
                else{
                    logger.warn(`ProductScope: updateProductScopeCommProduct: El Alcance de este producto no pudo ser modificado`);
                    return res.status(400).json({
                        ok:false,
                        message:'El Alcance de este producto no pudo ser modificado'
                    })
                }
            }).catch(error=>{
                logger.error(`ProductScope: updateProductScopeCommProduct error: ${error.message}`);
                return res.status(404).json({
                    ok:false,
                    mensaje:error.message,
                    error:error.message,
                });
            });   
        }
        else{
            logger.warn(`ProductScope: updateProductScopeCommProduct: Item no encontrado`);
            return res.status(400).json({
                ok:false,
                message:'Item no encontrado'
            });
        }
    }).catch(error=>{
        logger.error(`ProductScope: updateProductScopeCommProduct error: ${error.message}`);
        res.status(404).json({
            ok:false,
            mensaje:"Debe cargar correctamente los campos",
            error:error.message,
        });
    }); 
} // fin updateProductScopeCommProduct



module.exports = {
    //Aca exporto los metodos
    getProducts,
    getSubscriberSuscriptionCommProduct,
    getBySuscriptionProductIdCommProduct,
    getProductCommProduct,
    getAllProductsCommProduct,
    addSubscriptionCommProduct,
    createProductCommProduct,
    createProductScopeCommProduct,
    disableSubscriptionCommProduct,
    updateProductCommProduct,
    updateProductScopeCommProduct
  }



