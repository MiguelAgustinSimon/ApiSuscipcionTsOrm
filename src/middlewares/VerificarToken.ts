import { Request,Response,NextFunction } from 'express';
import jwt from 'jsonwebtoken'
//Authorization: Barer <token>
require("dotenv").config({path:"./.env"});



export const verificarToken =(req:Request, res:Response, next:NextFunction) => {

        const bearerHeader = req.headers['authorization'];
        let bearerToken='';
        if(typeof bearerHeader !== 'undefined'){
          bearerToken = bearerHeader.split(" ")[1];
          //req.token=bearerToken;
        }else{
          res.sendStatus(403);
        }
     
     
      jwt.verify(bearerToken, process.env.PUBLIC_KEY!, (error) => {
        //req.token.expiresIn= '365d';

        if(error){
          res.sendStatus(403);
        }else{
          next();
        }
      })
  }
  

