import { Router } from 'express';
import upload from '../middlewares/multer.middleware.js';
import { createAdmin, loginAdmin } from '../controllers/admin.controllers.js';
import Admin from '../models/admin.models.js';

const router = Router();

router.route('/').get((req, res) => {
        res.render('admin-login');
}).post(loginAdmin);

router.route('/create').get((req, res) => {
        res.render('admin-create');
}).post(upload.single('avatar'), createAdmin);

router.route('/dashboard').get(async (req, res) => {
    const user = await Admin.findOne({ role: 'owner' });
    res.render('admin-dashboard', {user: user, pendingManagers: []});
});

if(process.env.NODE_ENV === 'development'){
    router.get('/error', (req, res) => {
        res.render('error', { message: 'Unauthorized', status: 401 });
    });
}


export default router;