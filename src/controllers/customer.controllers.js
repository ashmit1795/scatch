import Customer from "../models/customer.models.js";
import Admin from "../models/admin.models.js";
import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";

const customerDebug = debug("app:controller:customer");

const renderShop = asyncHandler(async (req, res, next) => {
    const products = await Product.find();

    let user = null;
    if(req.user){
        if(req.user.role){
            user = await Admin.findById(req.user._id);
        } else {
            user = await Customer.findById(req.user._id);
        }
    }
    return res.render("customer-shop", { user, products });
});

const renderCustomerRegister = asyncHandler(async(req, res, next) => {
    customerDebug("Rendering customer registration page");
    return res.render("customer-register", { user: undefined });
});

export { renderShop, renderCustomerRegister };