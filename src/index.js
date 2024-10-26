import connectDB from './db/index.js';
import express from 'express';
import AppError from './utils/AppError.js';
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
});

const app = express();
const port = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.error(`Error: ${error.message}`);
            throw new AppError(500, 'Server error');
        });

        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    })
    .catch((error) => {
        console.error(`Error: ${error.message}`);
        throw new AppError(500, 'Server error');
    });
