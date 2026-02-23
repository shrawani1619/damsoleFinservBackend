import express from 'express';
import { listFieldDefinitions, createFieldDefinition } from '../controllers/fieldDefinition.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// Require authentication for listing/creating field defs (Lead Form builder is admin-only)
router.use(authenticate);
router.get('/', requireRole('super_admin', 'accounts_manager', 'regional_manager'), listFieldDefinitions);
router.post('/', requireRole('super_admin', 'accounts_manager', 'regional_manager'), createFieldDefinition);

export default router;

