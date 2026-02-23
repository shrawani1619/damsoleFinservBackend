import { Router } from 'express';
import {
    getAccountantManagers,
    getAccountantManagerById,
    createAccountantManager,
    updateAccountantManager,
    deleteAccountantManager,
} from '../controllers/accountantManager.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const accountantManagerRouter = Router();

// All routes require authentication and super_admin role
accountantManagerRouter.use(authenticate);
accountantManagerRouter.use(requireRole('super_admin'));

accountantManagerRouter.get('/', getAccountantManagers);
accountantManagerRouter.get('/:id', getAccountantManagerById);
accountantManagerRouter.post('/', createAccountantManager);
accountantManagerRouter.put('/:id', updateAccountantManager);
accountantManagerRouter.delete('/:id', deleteAccountantManager);
accountantManagerRouter.put('/:id/status', updateAccountantManager); // updateAccountantManager can handle status too

export default accountantManagerRouter;
