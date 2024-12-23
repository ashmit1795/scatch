import { Router } from "express";
import upload from '../middlewares/multer.middleware.js';
import { createProduct, deleteProduct, editProduct, renderCreateProduct, renderEditProduct } from "../controllers/product.controllers.js";
import { authenticateUser, authorizeUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/create').get(authenticateUser, authorizeUser('owner', 'manager'), renderCreateProduct).post(authenticateUser, authorizeUser('owner', 'manager'), upload.single('image'), createProduct);

router.route('/edit/:productId').get(authenticateUser, authorizeUser('owner', 'manager'), renderEditProduct).post(authenticateUser, authorizeUser('owner', 'manager'), upload.single('image'), editProduct);

router.route('/delete/:productId').post(authenticateUser, authorizeUser('owner', 'manager'), deleteProduct);

export default router;