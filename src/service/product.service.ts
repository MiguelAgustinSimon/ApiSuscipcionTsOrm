import {Any, Raw, Repository, UpdateResult } from "typeorm";
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
var moment = require('moment'); 

export default class ProductService {
    
    getProducts=async(unProductID:any,page:any,size:any)=>{
        return await Product.find({
            where: { 
                product_id: unProductID
              },
            relations: {
                product_Subscriptions: true,
            },
            take:size,
            skip:page*size
          
        });
    }

    obtenerProductoEspecifico = async (product_code:any) => {
        //sirve para devolver el product_id en getSubscriberSuscriptionCommProduct
        let id=0;
        await Product.findOne({
            where: {product_code} 
          })
        .then( (data:any)=>{
            id=data.product_id;
        })
        .catch( (error)=>{
                console.log(`error: ${error}`);
        });
        console.log(id);
        return id;
    }

    obtenerProducto = async (where:any) => {
        //sirve para devolver el product_id en getSubscriberSuscriptionCommProduct
        let datos:any;
        await Product.findOne({
            where: where
          })
        .then( (data:any)=>{
            datos=data;
        })
        .catch( (error)=>{
                console.log(`error: ${error}`);
        });
        return datos;
    }

    getSubscriberSuscriptionCommProduct=async(where:any,page:any,size:any)=>{
        return await Product_Subscription.find({ 
            where,
            take:size,
            skip:page*size,
            relations: [ 'product', 'product.product_Scopes','product.product_type'],
            order: {
                product_subscription_id:"ASC",
                product: {product_name: "ASC"}
            }
           })
    }

    consultarExistenciaProducto = async (product_id:any) => {
        //sirve para devolver el product_id en getSubscriberSuscriptionCommProduct
        let datos:any;

        await Product.findOne({
            where: {product_id} 
          })
        .then( (data:any)=>{
            datos=data
        })
        .catch( (error)=>{
                console.log(`error: ${error}`);
        });
        return datos;
    }

    getBySuscriptionProductIdCommProduct=async (where:any,page:any,size:any)=> {
        return await Product.find({ 
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
    }

    getProductCommProduct=async (product_code:any)=> {
        return  await Product.find({
            where: {product_code:product_code}, 
            relations: {
                product_Scopes:true,
                product_type:true
            }            
          })
    }

    getAllProductsCommProduct=async (where:any,page:any,size:any)=> {
        return await Product.find({ 
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
    }

    verificarExistenciaSuscripcion=async (subscriber_id:any,product_id:any)=> {
        //Verificamos si la relacion ya existe
        let datos:any;
        await Product_Subscription.findOne({
            where: {
                subscriber_id: subscriber_id,
                product_id: product_id,
                is_active:true
            }
            }).then( (data:any)=>{
                if(data){
                    datos=data;

                }
            })
            .catch( (error)=>{
                console.log(`error: ${error}`);
            });
            return datos;
    }

    traerSuscripcionInactiva=async (subscriber_id:any,product_id:any)=> {
        //Verificamos si la relacion ya existe
        let datos:any;
        await Product_Subscription.findOne({
            where: {
                subscriber_id: subscriber_id,
                product_id: product_id,
                is_active:false
            }
            }).then( (data:any)=>{
                if(data){
                    datos=data;

                }
            })
            .catch( (error)=>{
                console.log(`error: ${error}`);
            });
            return datos;
    }

    addSubscriptionCommProduct=async(subscriber_id:any,product_id:any,validaStartDate:any,validaFinishDate:any,account_executive_ref_id:any,fechaHoy:any,email:any)=>{
        const ps=new Product_Subscription();
        ps.subscriber_id=subscriber_id,
        ps.product_id=product_id,   
        ps.subscription_start_date=validaStartDate,
        ps.subscription_finish_date=validaFinishDate,
        ps.is_active=true,//true
        ps.account_executive_ref_id=account_executive_ref_id,
        ps.creation_date=fechaHoy,// yyyy-mm-dd
        ps.creation_user=email
        await ps.save();
        return ps;
    }

    verificarExistenciaProductType=async (product_type_code:any)=> {
        //Verificamos si la relacion ya existe
        let datos:any;
        await Product_Type.findOne(
        {
            where: {product_type_code}
        }).then( (data:any)=>{
            if(data){
                datos=data;
            }
        })
        .catch( (error)=>{
            console.log(`error: ${error}`);
        });
        return datos;
    }

    createProductCommProduct=async(product_code:any,product_name:any,product_type_id:any,apply_eol:any,apply_ius:any)=>{
        const producto=new Product();
        producto.product_code=product_code,
        producto.product_name=product_name,   
        producto.product_type_id=product_type_id,
        producto.apply_eol=apply_eol,
        producto.apply_ius=apply_ius

        await producto.save();
        return producto;
    }

    verificarExistenciaProductScope=async (product_id:any)=> {
        //Verificamos si la relacion ya existe
        let existe=false;

        await Product_Scope.findOne({
            where: {
                product_id:product_id,
                is_active:true
            }
        }).then( (data:any)=>{
            if(data){
                existe=true;
            }
        })
        .catch( (error)=>{
            console.log(`error: ${error}`);
        });
        return existe;
    }

    createProductScopeCommProduct=async(product_id:any,product_max_access_count:any,product_max_user_count:any,scope_finish_date:any)=>{
        let fechaHoy= moment();

        const prodScope=new Product_Scope();
        prodScope.product_id=product_id,
        prodScope.product_max_access_count=product_max_access_count,   
        prodScope.product_max_user_count=product_max_user_count,
        prodScope.scope_finish_date=scope_finish_date,
        prodScope.scope_start_date=fechaHoy,
        prodScope.creation_date=fechaHoy
        console.log(prodScope);
        await prodScope.save();
        return prodScope;
    }

    disableSubscriptionCommProduct=async(product_subscription_id:any,email:any)=>{
        let fechaHoy= moment();

        const ps=new Product_Subscription();
        ps.is_active=false,
        ps.modification_date=fechaHoy,
        ps.modification_user=email

        let disable:any=await Product_Subscription.update({product_subscription_id:product_subscription_id}, ps);
        return disable;
    }

    updateProductCommProduct=async(product_code:any,product_name:any,product_type_id:any,apply_eol:any,apply_ius:any)=>{
        let fechaHoy= moment();

        const modeloProducto=new Product();
        modeloProducto.product_code=product_code,
        modeloProducto.product_name=product_name,
        modeloProducto.product_type_id=product_type_id,
        modeloProducto.apply_eol=apply_eol,
        modeloProducto.apply_ius=apply_ius,
        modeloProducto.modification_date=fechaHoy;

        let p:any=await Product.update({product_id:modeloProducto.product_id},modeloProducto)

        return p;
    }

    
}