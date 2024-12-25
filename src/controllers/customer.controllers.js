import Customer from "../models/customer.models.js";
import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";

const customerDebug = debug("app:controller:customer");

const renderShop = asyncHandler(async (req, res, next) => {
    const products = await Product.find();
    return res.render("customer-shop", { user: undefined, products });
});

export { renderShop };