import { Router } from 'express';
import {
  getCompanySettings,
  updateCompanySettings,
} from '../controllers/companySettings.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const companySettingsRouter = Router();

// All routes require authentication
companySettingsRouter.use(authenticate);

// Get company settings (all authenticated users)
companySettingsRouter.get('/', getCompanySettings);

// Update company settings (Admin only)
companySettingsRouter.put('/', requireRole('super_admin'), updateCompanySettings);

export default companySettingsRouter;

