import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import AppError from '../utils/AppError.js';
import debug from 'debug';

const dbDebug = debug('app:database');

const connectDB = async () => {
    try {
        dbDebug(`Attempting to connect to MongoDB: ${process.env.MONGODB_URL}/${DB_NAME}`);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        dbDebug(`Connected to MongoDB: ${connectionInstance.connection.host}`);
    } catch (error) {
        dbDebug(`Database connection failed: ${error.message}`);
        throw new AppError(500, 'Database connection failed');
    }
};

export default connectDB;
