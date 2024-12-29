import { Router } from "express";
import { renderCustomerRegister, renderShop } from "../controllers/customer.controllers.js";
import { optionalAuthenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/').get(optionalAuthenticateUser, renderShop);

router.route('/register').get(renderCustomerRegister);

export default router;