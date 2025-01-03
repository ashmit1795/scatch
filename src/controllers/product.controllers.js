import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";
import { uploadToCloudinary, deleteFileFromCloudinary } from "../utils/Cloudinary.js";
import Admin from '../models/admin.models.js';
import Message from '../models/message.models.js';

const productDebug = debug("app:controller:product");

const renderCreateProduct = asyncHandler(async (req, res, next) => {
    productDebug('Rendering Create Product');
    const admin = await Admin.findById(req.user._id).select("-password -refreshToken");
    const categories = await getAllCategories();
    res.render('create-product', { user: admin, categories });
});

const createProduct = asyncHandler(async (req, res, next) => {
    productDebug('Creating Product');
    const { name, description, price, selectedCategories, newCategories, stock, discount, bgColor } = req.body;
    const imageLocalPath = req.file.path;

   // Ensure selectedCategories is always an array
    const selectedCategoriesArray = Array.isArray(selectedCategories)
    ? selectedCategories
    : selectedCategories
    ? [selectedCategories]
    : [];

    // Merge existing and new categories
    const allCategories = [
    ...selectedCategoriesArray, // Existing categories
    ...(newCategories ? newCategories.filter(cat => cat.trim()) : []), // New categories (non-empty)
    ];


    // Upload image to Cloudinary
    const imageUploadResponse = await uploadToCloudinary(imageLocalPath, 'product');
    if(!imageUploadResponse.url){
        productDebug('Image upload failed');
        req.flash('error_msg', 'Image upload failed');
        return res.status(500).redirect('/app/product/create');
    }
    productDebug('Image uploaded to Cloudinary');

    // Create product
    const newProduct = await Product.create({
        name,
        description,
        price,
        categories: allCategories,
        stock,
        discount,
        bgColor,
        image: imageUploadResponse.url,
        createdBy: req.user._id
    });

    const createdProduct = await Product.findById(newProduct._id);
    if(!createdProduct){
        productDebug('Error creating product');
        req.flash('error_msg', 'Error creating product');
        return res.status(500).redirect('/app/product/create');
    }
    productDebug('Product created successfully');
    req.flash('success_msg', 'Product created successfully');
    return res.status(201).redirect('/app/product/create');
});

const renderEditProduct = async (req, res, next) => {
    productDebug('Rendering Edit Product');
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    const admin = await Admin.findById(req.user._id).select("-password -refreshToken");
    const categories = await getAllCategories();
    res.render('edit-product', { user: admin, product, categories });
};

const editProduct = asyncHandler(async (req, res, next) => {
    productDebug('Editing Product');
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
        productDebug('Product not found');
        req.flash('error_msg', 'Product not found');
        return res.status(404).redirect('/app/product/create');
    }

    productDebug('Product found');

    // Destructure fields from request body
    const { name, description, price, stock, discount, bgColor, selectedCategories, newCategories } = req.body;

   
    // Ensure selectedCategories is always treated as an array
    const selectedCategoriesArray = Array.isArray(selectedCategories)
        ? selectedCategories
        : selectedCategories
        ? [selectedCategories]
        : [];

    // Merge categories
    const allCategories = [
        ...selectedCategoriesArray,
        ...(newCategories) ? newCategories.filter((cat) => cat.trim()) : [],
    ];

    // Handle image upload
    let imageUrl = product.image; // Use existing image by default
    if (req.file) {
        const imageLocalPath = req.file.path;

        // Upload image to Cloudinary
        const imageUploadResponse = await uploadToCloudinary(imageLocalPath, 'product');
        if (!imageUploadResponse.url) {
            productDebug('Image upload failed');
            req.flash('error_msg', 'Image upload failed');
            return res.status(500).redirect(`/app/product/edit/${productId}`);
        }

        productDebug('Image uploaded to Cloudinary');
        imageUrl = imageUploadResponse.url; // Update with new image URL
    }

    // Update the product
    const updatedProduct = await Product.findByIdAndUpdate(
        product._id,
        {
            name,
            description,
            price,
            categories: allCategories, // Use merged categories
            stock,
            discount,
            bgColor,
            image: imageUrl,
        },
        { new: true }
    );

    if (!updatedProduct) {
        productDebug('Error updating product');
        req.flash('error_msg', 'Error updating product');
        return res.status(500).redirect(`/app/product/edit/${productId}`);
    }

    productDebug('Product updated successfully');
    req.flash('success_msg', 'Product updated successfully');
    return res.status(200).redirect(`/app/product/edit/${updatedProduct._id}`);
});

const deleteProduct = asyncHandler(async (req, res, next) => {
    const productId = req.params.productId;
    const redirectUrl = req.query.redirect || '/app/admin/all-products'; // Default to all-products if no query parameter is provided.

    productDebug('Deleting Product');
    const product = await Product.findById(productId);
    if (!product) {
        productDebug('Product not found');
        req.flash('error_msg', 'Product not found');
        return res.status(404).redirect(redirectUrl);
    }

    productDebug('Product found');
    // Delete image from Cloudinary
    await deleteFileFromCloudinary(product.image);
    productDebug('Image deleted from Cloudinary');

    const messages = await Message.find({ productId: productId }).select('_id');
    productDebug('Messages found');
    if (messages.length > 0) {
        // Delete all messages related to the product
        await Message.deleteMany({ productId: productId });
    }
    
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
        productDebug('Error deleting product');
        req.flash('error_msg', 'Error deleting product');
        return res.status(500).redirect(redirectUrl);
    }

    productDebug('Product deleted successfully');
    req.flash('success_msg', 'Product deleted successfully');
    return res.status(200).redirect(redirectUrl);
});


export { renderCreateProduct, createProduct, renderEditProduct, editProduct, deleteProduct };

const getAllCategories =async (req, res, next) => {
    const categories = await Product.find().distinct('categories');

    return [...new Set(categories)];
};