import Customer from "../models/customer.models.js";
import Admin from "../models/admin.models.js";
import debug from "debug";
import { asyncHandler } from "../utils/AsyncHandler.js";
import Product from "../models/product.models.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import fs, { stat } from "fs";

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

const registerCustomer = asyncHandler(async(req, res, next) => {
    customerDebug("Registering customer");
    const { username, email, fullName, contact, address, password } = req.body; 

    if (password.length < 6) {
        customerDebug('Invalid password');
        req.flash('error_msg', 'Password must be at least 6 characters long');
        return res.status(400).redirect('/app/customer/register');
    }

    const avatarLocalPath = req.file.path;
    const existingUser = await Customer.findOne({ $or: [{email}, {username}] }) || await Admin.findOne({ $or: [{email}, {username}] });
    if(existingUser){
        customerDebug('User already exists');
        req.flash('error_msg', 'Account already exists');
        if(existingUser){
            fs.unlinkSync(avatarLocalPath, (error) =>{
                if(error){
                    customerDebug('Error deleting avatar');
                }
            });

            if(existingUser.role){
                return res.status(400).redirect('/app/admin/');
            } else {
                return res.status(400).redirect('/app/customer/login');
            }
        }
    }

    
    const avatarUploadResponse = await uploadToCloudinary(avatarLocalPath);
    if(!avatarUploadResponse.url){
        customerDebug('Error uploading avatar');
        req.flash('error_msg', 'Error uploading avatar');
        return res.status(500).redirect('/app/customer/register');
    }
    customerDebug('Avatar Uploaded Successfully');

    // Create a new customer
    const newCustomer = new Customer({
        username,
        email,
        fullName,
        contact,
        address,
        password,
        avatar: avatarUploadResponse.url
    });
    
    const createdCustomer = await Customer.findById(newCustomer._id);
    if(!createdCustomer){
        customerDebug('Error creating customer');
        req.flash('error_msg', 'Error creating account');
        return res.status(500).redirect('/app/customer/register');
    }

    const {accessToken, refreshToken} = await generateTokens(createdCustomer._id);

    const options = {
        httpOnly: true,
        secure: true,
    };

    customerDebug('Customer created successfully');
    req.flash('success_msg', 'Account created successfully');
    return res.status(201)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .redirect('/app/customer/');
    
});

export { renderShop, renderCustomerRegister, registerCustomer };

async function generateTokens(customerId) {
    try {
        const customer = await Customer.findById(customerId);

        const accessToken = customer.generateAccessToken();

        const refreshToken= customer.generateRefreshToken();

        customer.refreshToken = refreshToken;
        await customer.save({validateBeforeSave: false});

        return {accessToken, refreshToken};
        
    } catch (error) {
        customerDebug(error.message);
        res.render('error', { user: undefined, message: error.message, status: 400 });
    }
}