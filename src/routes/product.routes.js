import { Router } from "express";
import upload from '../middlewares/multer.middleware.js';
import { createProduct, renderCreateProduct } from "../controllers/product.controllers.js";

const router = Router();

router.route('/create').get(renderCreateProduct).post(upload.single('image'), createProduct);

export default router;