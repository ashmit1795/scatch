import { Router } from "express";
import { sendMessage } from "../controllers/message.controllers.js";
import { authenticateUser, authorizeUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/send-message").post(authenticateUser, authorizeUser('owner') ,sendMessage);

export default router;