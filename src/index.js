import connectDB from './db/index.js';
import express from 'express';
import AppError from './utils/AppError.js';
import dotenv from 'dotenv';
import debug from 'debug';

// Load environment variables
dotenv.config({
    path: './.env'
});

const app = express();
const port = process.env.PORT || 3000;

const dbDebug = debug('app:database');
const serverDebug = debug('app:server');

connectDB()
    .then(() => {
        dbDebug('Database connected');
        app.on('error', (error) => {
            serverDebug(`Server Error: ${error.message}`);
            throw new AppError(500, 'Server error');
        });

        app.listen(3000, () => {
            serverDebug(`Server running on port ${port}`);
        });
    })
    .catch((error) => {
        serverDebug(`Server Error: ${error.message}`);
        throw new AppError(500, 'Server error');
    });
