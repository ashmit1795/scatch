import { Router } from "express";
import upload from "../middlewares/multer.middleware.js";
import { createAdmin, loginAdmin } from "../controllers/admin.controllers.js"

const router = Router();

router.route("/").get((req, res) => {
    res.render("admin-login");
}).post(loginAdmin);

router.route("/create").get((req, res) => {
    res.render("admin-create");
}).post(upload.single("avatar"), createAdmin);


router.get("/dashboard", (req, res) => {
    res.render("admin");
});
export default router;