import { Router } from "express";
import { renderShop } from "../controllers/customer.controllers.js";

const router = Router();

router.route('/').get(renderShop)

export default router;