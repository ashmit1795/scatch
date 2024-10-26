import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';
import AppError from '../utils/AppError.js';


const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
        console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw new AppError(500, 'Database connection failed');
    }
};

export default connectDB;
