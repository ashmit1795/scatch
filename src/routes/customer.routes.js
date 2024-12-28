import { Router } from "express";
import { renderShop } from "../controllers/customer.controllers.js";
import { optionalAuthenticateUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route('/').get(optionalAuthenticateUser, renderShop)

export default router;