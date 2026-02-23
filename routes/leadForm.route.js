import express from 'express';
import { createLeadForm, updateLeadForm, getLeadFormByBank, getNewLeadForm, listLeadForms } from '../controllers/leadForm.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Get lead form (requires auth - returns role-based fields)
router.get('/bank/:bankId', authenticate, getLeadFormByBank);
router.get('/new-lead', authenticate, getNewLeadForm);

// Protected admin routes for managing lead forms
router.use(authenticate);
router.post('/', requireRole('super_admin', 'accounts_manager', 'regional_manager'), createLeadForm);
router.put('/:id', requireRole('super_admin', 'accounts_manager', 'regional_manager'), updateLeadForm);
router.get('/', requireRole('super_admin', 'accounts_manager', 'regional_manager'), listLeadForms);

export default router;

