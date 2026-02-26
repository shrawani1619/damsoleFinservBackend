import { Router } from 'express';
import {
  getFranchiseCommissionLimits,
  getFranchiseCommissionLimitById,
  getFranchiseCommissionLimitByBank,
  createFranchiseCommissionLimit,
  updateFranchiseCommissionLimit,
  deleteFranchiseCommissionLimit,
} from '../controllers/franchiseCommissionLimit.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const franchiseCommissionLimitRouter = Router();

// All routes require authentication
franchiseCommissionLimitRouter.use(authenticate);

// GET routes - accessible by all authenticated users (including franchise)
franchiseCommissionLimitRouter.get('/', getFranchiseCommissionLimits);
franchiseCommissionLimitRouter.get('/bank/:bankId', getFranchiseCommissionLimitByBank);
franchiseCommissionLimitRouter.get('/:id', getFranchiseCommissionLimitById);

// Write operations - only for admin or accounts_manager
franchiseCommissionLimitRouter.post('/', requireRole('super_admin', 'accounts_manager'), createFranchiseCommissionLimit);
franchiseCommissionLimitRouter.put('/:id', requireRole('super_admin', 'accounts_manager'), updateFranchiseCommissionLimit);
franchiseCommissionLimitRouter.delete('/:id', requireRole('super_admin', 'accounts_manager'), deleteFranchiseCommissionLimit);

export default franchiseCommissionLimitRouter;

