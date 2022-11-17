import {Raw, Repository, UpdateResult } from "typeorm";
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
    
    async getProducts(unProductID:any,page:any,size:any) {
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

    async getSubscriberSuscriptionCommProduct(where:any,page:any,size:any) {
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
}