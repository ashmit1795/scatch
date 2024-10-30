import debug from 'debug';
import Admin from '../models/admin.models.js';
import {uploadToCloudinary} from '../utils/Cloudinary.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import AppError from '../utils/AppError.js';
import Product from '../models/product.models.js';

const adminDebug = debug("app:controller:admin");

const renderAdminCreate = (req, res, next) => {
    adminDebug('Rendering Admin Create');
    res.render('admin-create');
};

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

    const createdAdmin = await Admin.findById(newAdmin._id).select("-password -refreshToken");
    if (!createdAdmin) {
        adminDebug('Error creating admin');
        throw new AppError(500, 'An error occurred while creating the admin');
    }

    const { accessToken, refreshToken } = await generateTokens(createdAdmin._id);

    const options = {
        httpOnly: true,
        secure: true,
    };
    
    adminDebug('Admin created successfully');
    req.flash('success_msg', 'Admin created successfully');
    return res.status(201)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .redirect('/app/admin/');
});

const renderAdminLogin = (req, res, next) => {
    adminDebug('Rendering Admin Login');
    res.render('admin-login');
};

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

const renderAdminDashboard = asyncHandler(async (req, res, next) => {
    adminDebug('Rendering Admin Dashboard');
    const admin = await Admin.findById(req.user._id).select("-password -refreshToken");
    const products = await Product.find({ createdBy: admin._id });
    res.render('admin-dashboard', {user: admin, products: products});
});

const logoutAdmin = asyncHandler(async (req, res, next) => {
    adminDebug('Logging out Admin');
    adminDebug('User ID: ', req.user);
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
        adminDebug('Admin not found');
        req.flash('error_msg', 'Admin not found');
        return res.status(404).redirect('/app/admin/');
    }

    admin.refreshToken = null;
    await admin.save({ validateBeforeSave: false });

    adminDebug('Logout successful');
    req.flash('success_msg', 'Logout successful');

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
            .clearCookie("refreshToken", options)    
            .clearCookie("accessToken", options)
            .redirect('/app/admin/');
});

const renderManagerApproval = asyncHandler(async (req, res, next) => {
    adminDebug('Rendering Manager Approval');
    const managers = await Admin.find({ role: 'manager', approved: false });
    res.render('manager-approval', {pendingManagers: managers});
});

const managerApproval = asyncHandler(async(req, res, next) => {
    const { managerId } = req.params;
    adminDebug('Approving Manager');

    const manager = await Admin.findById(managerId);
    if (!manager) {
        adminDebug('Manager not found');
        req.flash('error_msg', 'Manager not found');
        return res.status(404).redirect('/app/admin/manager-approval');
    }

    manager.approved = true;
    await manager.save({ validateBeforeSave: false });

    adminDebug('Manager approved');
    req.flash('success_msg', 'Manager approved');
    return res.status(200).redirect('/app/admin/manager-approval');
});

const managerDenial = asyncHandler(async(req, res, next) => {
    const { managerId } = req.params;
    adminDebug('Denying Manager');

    const manager = await Admin.findById(managerId);
    if (!manager) {
        adminDebug('Manager not found');
        req.flash('error_msg', 'Manager not found');
        return res.status(404).redirect('/app/admin/manager-approval');
    }
    // Delete manager
    await Admin.findByIdAndDelete(managerId);

    adminDebug('Manager denied');
    req.flash('success_msg', 'Manager denied');
    return res.status(200).redirect('/app/admin/manager-approval');
});

export { createAdmin, loginAdmin, renderAdminDashboard, renderManagerApproval, managerApproval, managerDenial, renderAdminCreate, renderAdminLogin, logoutAdmin };

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