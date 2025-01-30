import { Router } from "express";
import { renderCustomerRegister, renderShop, registerCustomer } from "../controllers/customer.controllers.js";
import { optionalAuthenticateUser } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.route('/').get(optionalAuthenticateUser, renderShop);

router.route('/register').get(renderCustomerRegister).post(upload.single('avatar'), registerCustomer);

export default router;