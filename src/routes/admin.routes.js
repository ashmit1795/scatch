import { Router } from 'express';
import upload from '../middlewares/multer.middleware.js';
import { createAdmin, loginAdmin, managerApproval, managerDenial, renderAdminDashboard, renderManagerApproval } from '../controllers/admin.controllers.js';
import { authenticateUser, authorizeUser } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/').get((req, res) => {
        res.render('admin-login');
}).post(loginAdmin);

router.route('/create').get((req, res) => {
        res.render('admin-create');
}).post(upload.single('avatar'), createAdmin);

router.route('/dashboard').get(authenticateUser, authorizeUser('owner', 'manager'), renderAdminDashboard);

router.route('/manager-approval').get(authenticateUser, authorizeUser('owner'), renderManagerApproval);

router.route('/approve-manager/:managerId').get(authenticateUser, authorizeUser('owner'), managerApproval);

router.route('/deny-manager/:managerId').get(authenticateUser, authorizeUser('owner'), managerDenial);

if(process.env.NODE_ENV === 'development'){
    router.get('/error', (req, res) => {
        res.render('error', { message: 'Unauthorized', status: 401 });
    });
}


export default router;