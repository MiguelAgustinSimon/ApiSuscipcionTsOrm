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

    const [count]:any= await Product.findAndCount({
        take:size,
        skip:page*size,
        where
    })
    res.header('X-Total-Count', count.length);

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

//Traer producto especifico por codProd ERP
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

//Lista de Productos por tipo 
const getAllProductsCommProduct= async (req:Request,res:Response) => {
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
    let pageSize=(page*size);
    let [count]:any = await Product.findAndCount({
        where,
        take:size,
        skip:pageSize
    });
    let contador:any=count.length;
    res.header('X-Total-Count', contador);
   
   await Product.find({ 
        where,
        take:size,
        skip:page*size,
        relations: {
            product_Scopes:true,
            product_type:true
        }, 
        order: {
            product_name: 'ASC',
            product_code: 'ASC'
        }
   })
   .then( (data)=>{
        if (data.length===0) 
        { 
            logger.warn(`ProductScope: getAllProductsCommProduct: Datos no encontrados`);
            return res.status(404).json({message: "Datos no encontrados."})
        }
        else{
            logger.info(`ProductScope: getAllProductsCommProduct ok`);
            return res.status(200).json(data);
        }
   })
  .catch( (error)=>{
        logger.error(`ProductScope: getAllProductsCommProduct error: ${error.message}`);
        res.json({error:error.message});
   });
}


// ---------------------------------------------------- RUTAS POST--------------------------------------------------------------
//Alta de Producto-Suscripcion
const addSubscriptionCommProduct = async (req:Request,res:Response) => { 
    try{
    //let fechaHoy= new Date().toISOString().slice(0, 10);    
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
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }
    if(!UUIDChecker(product_id)){
        logger.warn(`ProductScope: addSubscriptionCommProduct: Ingrese un UUID valido: ${product_id}`);
        return res.status(400).json({message: 'Ingrese un UUID valido'});
    }

    //verifico si existe el suscriptor
    const suscriptor = await Subscriber.find({where: {subscriber_id}});
    //verifico si existe el producto
    const producto = await Product.find({where: {product_id}});

    if(!suscriptor){
      logger.warn(`addSubscriptionCommProduct: Suscriptor no existente: ${suscriptor}`);
      return res.status(404).json({message: "Suscriptor no existente"});
    }

    if(!product_id || !producto){
        logger.warn(`addSubscriptionCommProduct: No se ingreso product_id`);
        return res.status(400).json({message: "No se ingreso producto para el suscriptor o este es inexistente"})
    }
    if(!validaStartDate.isValid() ){//|| validaStartDate>=fechaHoy){ preguntar que hacemos con esto
        logger.warn(`addSubscriptionCommProduct: Fecha de inicio de suscripcion invalida`);
        return res.status(400).json({message: "Fecha de inicio de suscripcion invalida"})
    }
    if(!validaFinishDate.isValid()){
        logger.warn(`addSubscriptionCommProduct: Fecha de finalizacion de suscripcion invalida`);
        return res.status(400).json({message: "Fecha de finalizacion de suscripcion invalida"})
    }
    if(validaStartDate>validaFinishDate){
        logger.warn(`addSubscriptionCommProduct: Fecha de inicio mayor a la fecha de fin`);
        return res.status(400).json({message: "Fecha de inicio mayor a la fecha de fin"})
    }

    if(!account_executive_ref_id){
        account_executive_ref_id=0;
    }

    //Verificamos si la relacion ya existe
    const existeSuscripcion = await Product_Subscription.findOne({
        where: {
            subscriber_id: subscriber_id,
            product_id: product_id,
            is_active:true
        }
      });
      
      //Si ya existe devolvemos el resultado
      if(existeSuscripcion){
        logger.warn(`addSubscriptionCommProduct: Ya existe una suscripción para el producto y suscriptor informados: ${existeSuscripcion}`);
        return res.status(200).json({message: "Ya existe una suscripción para el producto y suscriptor informados."});
      }

      //que la fecha que ingresan no sea menor a la de hoy, ver: https://desarrolladores.me/2020/03/manipular-fechas-con-moment-js/
      const ps=new Product_Subscription();
        ps.subscriber_id=subscriber_id,
        ps.product_id=product_id,   
        ps.subscription_start_date=validaStartDate,
        ps.subscription_finish_date=validaFinishDate,
        ps.is_active=true,//true
        ps.account_executive_ref_id=account_executive_ref_id,
        ps.creation_date=fechaHoy,// yyyy-mm-dd
        ps.creation_user=req2.idpData.email
        await ps.save();
        if(ps){
            logger.info(`ProductScope: addSubscriptionCommProduct ok`);
            return res.json({ok:true,mensaje:'Item creado',ps});
        }
        else{
          logger.warn(`ProductScope: addSubscriptionCommProduct: El Item no pudo ser creado`);
          return res.json({
              ok:false,
              message:'El Item no pudo ser creado'
          })
        } 
    }
    catch (error) {
        logger.error(`ProductScope: addSubscriptionCommProduct: El Item no pudo ser creado ${error}`);
        return res.status(400).json({
            ok:false,
            mensaje:error,
            error:error
        });
    }  
} // fin addSubscriptionCommProduct


//Dar de alta un Producto nuevo
const createProductCommProduct = async (req:Request,res:Response) => {
    try {
        let fechaHoy= new Date().toISOString().slice(0, 10); //yyyy-mm-dd
        
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
        const _productType = await Product_Type.findOne(
        {
            where: {product_type_code}
        })
    
        if(!_productType){
            logger.warn(`ProductScope: createProductCommProduct - product type code inexistente ${product_type_code}`);
            return res.status(400).json({message: "product type code inexistente"});
        }

        if(!apply_eol || !apply_ius){
            logger.warn(`ProductScope: createProductCommProduct - apply_eol/apply_ius no informado`);
            return res.status(400).json({message: "apply_eol/apply_ius no informado"});
        }

        const producto=new Product();
        producto.product_code=product_code,
        producto.product_name=product_name,   
        producto.product_type_id=_productType.product_type_id,
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

//Dar de alta un Product Scope nuevo
const createProductScopeCommProduct = async (req:Request,res:Response) => {
    try{
    let fechaHoy= moment();
        
    const  { 
        product_id,
        product_max_access_count,     
        product_max_user_count,
        scope_finish_date
      } = req.body;

      //Verificar si existe este producto..
    const _producto = await Product.find({where: {product_id}})
    .then(_producto=>{
        if(!_producto){
            return res.status(400).json({message: "Producto no encontrado"});
        }
    }).catch((err) => res.status(404).json({message: "Producto no encontrado"}));

        //Verificar si ya existe un alcance activo para el producto
        const _productScope = await Product_Scope.findOne({
            where: {
                product_id:product_id,
                is_active:true
            }
        })
        if(_productScope){
            logger.warn(`ProductScope: createProductScopeCommProduct - Ya existe un alcance de producto activo para el id producto informado ${product_id}`);
            return res.status(200).json({message: "Ya existe un alcance de producto activo para el id producto informado"});
        }

        const prodScope=new Product_Scope();
        prodScope.product_id=product_id,
        prodScope.product_max_access_count=product_max_access_count,   
        prodScope.product_max_user_count=product_max_user_count,
        prodScope.scope_finish_date=scope_finish_date,
        prodScope.scope_start_date=fechaHoy,
        prodScope.creation_date=fechaHoy
        await prodScope.save();


        if(prodScope){
            logger.info(`ProductScope: createProductScopeCommProduct ok`);
            return res.status(201).json({ok:true,mensaje:'Alcance de Producto creado',prodScope});
        }
        else{
            logger.warn(`ProductScope: createProductScopeCommProduct: El Item no pudo ser creado`);
            return res.status(400).json({
                ok:false,
                message:'El Alcance de este producto no pudo ser creado'
            })
        }
      }
      catch (error) {
        logger.error(`ProductScope: createProductScopeCommProduct error: ${error}`);
        return res.status(400).json({
            ok:false,
            mensaje:error,
            error:error
        });
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



