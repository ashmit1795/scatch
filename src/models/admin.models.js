import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

// Admin schema
const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreshToken: {
        type: String
    },
    role: {
        type: String,
        default: "manager"
    }
}, {timestamps: true});

// Hash the password before saving the admin
adminSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Check if the password is correct
adminSchema.methods.isPasswordCorrect = async function(plainPassword){
    try {
        return await bcrypt.compare(plainPassword, this.password);
    } catch (error) {
        throw new AppError(500, error.message);
    }
}

// Generate access token
adminSchema.methods.generateAccessToken = function(){
    return jwt.sign({
        _id: this._id,
        username: this.username,
        email: this.email,
        fullName: this.fullName
    }, 
    process.env.ACCESS_TOKEN_SECRET, 
    {
        expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRES_IN
    });
}

// Generate refresh token
adminSchema.methods.generateRefreshToken = function() {
    return jwt.sign({
        _id: this._id,
    }, 
    process.env.REFRESH_TOKEN_SECRET, 
    {
        expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRES_IN
    });
}

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;

