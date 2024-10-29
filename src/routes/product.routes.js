import { Router } from "express";
import { renderCreateProduct } from "../controllers/product.controllers.js";

const router = Router();

router.route('/create').get(renderCreateProduct);

export default router;