import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import session from 'express-session';
import flash from 'connect-flash';

export const app = express();

const corsOptions = {
    origin: process.env.CORS_ORIGIN, // Allow only requests from the CORS_ORIGIN
    credentials: true, //Allow sending cookies
    optionsSuccessStatus: 200 // For legacy browser support
}

app.use(cors(corsOptions));

// Parse incoming JSON payloads
app.use(express.json({
    limit: '16kb'
}));

// Parse incoming urlencoded payloads
app.use(express.urlencoded({
    extended: true,
    limit: '16kb'
}));

// To serve static files such as images, CSS files, and JavaScript files
app.use(express.static('public'));

// Parse cookies from the incoming requests and populate req.cookies with an object keyed by the cookie names
app.use(cookieParser());

// Session and flash middleware
app.use(
    session({
        secret: 'your-secret-key',
        resave: false,
        saveUninitialized: true,
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 15, // Session expiry (15 minutes)
        },
    })
);

// Flash message middleware
app.use(flash());

// Pass flash messages to all views
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')[0] || null;
    res.locals.error_msg = req.flash('error_msg')[0] || null;
    next();
});


// Set view engine to ejs
app.set('view engine', 'ejs');

// Import routes
import adminRoutes from './routes/admin.routes.js';
import cartRoutes from './routes/cart.routes.js';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';

// Use routes
app.use('/app/admin', adminRoutes);
app.use('/app/cart', cartRoutes);
app.use('/app/customer', customerRoutes);
app.use('/app/product', productRoutes);