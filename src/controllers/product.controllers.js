import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

const productDebug = debug("app:controller:product");

const renderCreateProduct = (req, res, next) => {
  productDebug('Rendering Create Product');
  res.render('create-product');
};

export { renderCreateProduct };