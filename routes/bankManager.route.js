import { Router } from 'express';
import {
  createBankManager,
  getBankManagers,
  getBankManagerById,
  updateBankManager,
  updateBankManagerStatus,
  deleteBankManager,
} from '../controllers/bankManager.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const bankManagerRouter = Router();

bankManagerRouter.use(authenticate);

bankManagerRouter.post('/', requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), createBankManager);
bankManagerRouter.get('/', getBankManagers);
bankManagerRouter.get('/:id', getBankManagerById);
bankManagerRouter.put('/:id', requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), updateBankManager);
bankManagerRouter.delete('/:id', requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), deleteBankManager);
bankManagerRouter.put('/:id/status', requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), updateBankManagerStatus);

export default bankManagerRouter;
