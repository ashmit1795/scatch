import debug from 'debug';
import Admin from '../models/admin.models.js';
import {uploadToCloudinary} from '../utils/Cloudinary.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import AppError from '../utils/AppError.js';

const adminDebug = debug("app:controller:admin");

const createAdmin = asyncHandler(async (req, res, next) => {
    adminDebug('Registering Admin');
    let { username, email, fullName, password, role } = req.body;

    // Validate input
    if (!username.trim() || !email.trim() || !password.trim() || !fullName.trim()) {
        adminDebug('Invalid input');
        req.flash('error_msg', 'Please fill in all fields');
        return res.status(400).redirect('/app/admin/create');
    }

    if (!email.includes('@') || !email.includes('.')) {
        adminDebug("Invalid email");
        req.flash('error_msg', 'Please provide a valid email address');
        return res.status(400).redirect('/app/admin/create');
    }

    if (password.length < 6) {
        adminDebug('Invalid password');
        req.flash('error_msg', 'Password must be at least 6 characters long');
        return res.status(400).redirect('/app/admin/create');
    }

    // Check if admin already exists
    let existingAdmin = await Admin.findOne({ $or: [{username}, {email}] });
    if (existingAdmin) {
        adminDebug('Admin already exists');
        req.flash('error_msg', 'Admin already exists');
        return res.status(409).redirect('/app/admin/create');
    }

    // Check if owner already exists
    let owner = await Admin.findOne({ role: 'owner' });
    if (role === 'owner' && owner) {
        adminDebug('Owner already exists');
        req.flash('error_msg', 'Owner already exists');
        return res.status(409).redirect('/app/admin/create');
    }

    // Get avatar local path
    let avatarLocalPath = req.file.path;
    if(!avatarLocalPath){
        adminDebug('No avatar uploaded');
        req.flash('error_msg', 'Please upload an avatar');
        return res.status(400).redirect('/app/admin/create');
    }

    // Upload avatar to Cloudinary
    let avatarUploadResponse = await uploadToCloudinary(avatarLocalPath);
    if (!avatarUploadResponse.url) {
        adminDebug('Error uploading avatar');
        req.flash('error_msg', 'Error uploading avatar');
        return res.status(500).redirect('/app/admin/create');
    }
    adminDebug('Avatar uploaded successfully');

    // Create new admin
    const newAdmin = await Admin.create({
        username: username.toLowerCase(),
        email: email,
        fullName: fullName,
        password: password,
        role: role || 'manager',
        avatar: avatarUploadResponse.url
    });

    const createdAdmin = await User.findById(newAdmin._id).select("-password -refreshToken");
    if (!createdAdmin) {
        adminDebug('Error creating admin');
        throw new AppError(500, 'An error occurred while creating the admin');
    }

    const { accessToken, refreshToken } = await generateTokens(createdUser._id);

    const options = {
        httpOnly: true,
        secure: true,
    };
    
    adminDebug('Admin created successfully');
    req.flash('success_msg', 'Admin created successfully');
    return res.status(201)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .redirect('/app/admin/dashboard');
});

const loginAdmin = asyncHandler(async (req, res, next) => {
    let username;
    let email;
    const { usernameOrEmail , password } = req.body;
    adminDebug('Logging in Admin');
    adminDebug('Username or Email: ', usernameOrEmail);

    // Validate input
    if (!usernameOrEmail) {
        adminDebug('No username or email provided');
        req.flash('error_msg', 'Please provide a username or email');
        return res.status(400).redirect('/app/admin/');
    }
    
    if (!password) {
        adminDebug('No password provided');
        req.flash('error_msg', 'Please provide a password');
        return res.status(400).redirect('/app/admin/');
    }
    
    if(usernameOrEmail.includes("@") && usernameOrEmail.includes(".") ) {
        email = usernameOrEmail;
    } else {
        username = usernameOrEmail;
    } 

    // Check if admin exists
    const admin = await Admin.findOne({ $or: [{username}, {email}] });
    if (!admin) {
        adminDebug('Admin not found');
        req.flash('error_msg', 'Invalid credentials');
        return res.status(401).redirect('/app/admin/');
    }

    // Check if password is correct
    const isPasswordCorrect = await admin.isPasswordCorrect(password);

    if(!isPasswordCorrect) {
        adminDebug('Invalid credentials');
        req.flash('error_msg', 'Invalid credentials');
        return res.status(401).redirect('/app/admin/');
    }

    // Generate tokens
    const {accessToken, refreshToken} = await generateTokens(admin._id);

    admin.refreshToken = refreshToken;
    await admin.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true
    }

    adminDebug('Login successful');
    req.flash('success_msg', 'Login successful');
    return res.status(200)
        .cookie("refreshToken", refreshToken, options)
        .cookie("accessToken", accessToken, options)
        .redirect("/app/admin/dashboard");

});

export { createAdmin, loginAdmin };

async function generateTokens(adminId) {

    try {
        // 0
        const admin = await Admin.findById(adminId);
        // 1
        const accessToken = admin.generateAccessToken();
        // 2
        const refreshToken = admin.generateRefreshToken();
        // 3
        admin.refreshToken = refreshToken;
        await admin.save({ validateBeforeSave: false });
        // 4
        return { accessToken, refreshToken }
        
    } catch (error) {
        adminDebug(error.message);
        throw new AppError(500, "An error occurred while generating tokens");
    } 
}