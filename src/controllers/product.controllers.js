import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";

const productDebug = debug("app:controller:product");

const renderCreateProduct = (req, res, next) => {
  productDebug('Rendering Create Product');
  res.render('create-product');
};

const createProduct = asyncHandler(async (req, res, next) => {
    productDebug('Creating Product');
    const { name, description, price, category, stock, discount, bgColor, panelColor, textColor } = req.body;
    const imageLocalPath = req.file.path;

    // Upload image to Cloudinary
    const imageUploadResponse = await uploadToCloudinary(imageLocalPath, 'product');
    if(!imageUploadResponse.url){
        productDebug('Image upload failed');
        req.flash('error_msg', 'Image upload failed');
        return res.status(500).redirect('/product/create');
    }
    productDebug('Image uploaded to Cloudinary');

    // Create product
    const newProduct = await Product.create({
        name,
        description,
        price,
        category,
        stock,
        discount,
        bgColor,
        panelColor,
        textColor,
        image: imageUploadResponse.url
    });

    const createdProduct = await Product.findById(newProduct._id);
    if(!createdProduct){
        productDebug('Error creating product');
        req.flash('error_msg', 'Error creating product');
        return res.status(500).redirect('/product/create');
    }
    productDebug('Product created successfully');
    req.flash('success_msg', 'Product created successfully');
    return res.status(201).redirect('/product/create');
});

export { renderCreateProduct, createProduct };