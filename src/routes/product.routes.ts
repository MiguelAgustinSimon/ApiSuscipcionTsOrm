import { Router } from "express";
import { createProductCommProduct } from "../controllers/product.controller";
import { getProducts } from "../controllers/product.controller";

const router=Router();


router.get('/api/getProducts',getProducts);
router.post('/api/createProductCommProduct',createProductCommProduct);

export default router;