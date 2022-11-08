import { Router } from "express";
import { createProductCommProduct } from "../controllers/product.controller";
import { getProducts } from "../controllers/product.controller";

import {verificarToken} from "../middlewares/VerificarToken";

const router=Router();


router.get('/getProducts',verificarToken, getProducts);
router.post('/createProductCommProduct',createProductCommProduct);

export default router;