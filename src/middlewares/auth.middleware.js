import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import Admin from '../models/admin.models.js';
import { asyncHandler } from '../utils/AsyncHandler.js';
import debug from 'debug';

const authDebug = debug('app:middleware:auth');

export const authenticateUser = asyncHandler(async (req, res, next) => {
    const accessToken = req.cookies?.accessToken || req.headers['authorization']?.split(' ')[1];
    if (!accessToken) {
        authDebug('No access token provided');
        return res.render('error', { message: 'Unauthorized', status: 401 });
    }

    // Verify the access token
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
        authDebug('Invalid access token');
        return res.render('error', { message: 'Unauthorized', status: 401 });
    }

    // Check if the user exists
    const user = await Admin.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
        authDebug('User not found');
        return res.render('error', { message: 'Unauthorized', status: 401 });
    }

    req.user = user;
    next();
});

export const authorizeUser = (...allowedRoles) => {
    return async (req, res, next) => {
        // Check if the user is authorized
        if (!allowedRoles.includes(req.user.role)) {
            authDebug('User not authorized');
            return res.render('error', { message: 'Forbidden', status: 403 });
        }

        // Check if the manager is approved
        if (req.user.role === "manager") {
            const manager = await Admin.findById(req.user._id);
            if (!manager.approved) {
                authDebug('Manager access pending approval from owner');
                return res.render('error', { message: 'Access pending approval from owner', status: 403 });
            }
        }
        next();
    }
};