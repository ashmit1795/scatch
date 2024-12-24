import { Router } from "express";
import { sendMessage, updateMessageStatus } from "../controllers/message.controllers.js";
import { authenticateUser, authorizeUser } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/send-message").post(authenticateUser, authorizeUser('owner') ,sendMessage);

router.route("/update/:messageId").post(authenticateUser, authorizeUser('manager'), updateMessageStatus);

export default router;