import { Router } from 'express';
import {
  createLead,
  getLeads,
  getApprovedLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  verifyLead,
  getLeadDocuments,
  uploadLeadDocument,
  deleteLead,
  getLeadHistory,
  addDisbursement,
  forwardLeadToRM,
  getDisbursementEmailPreview,
  sendDisbursementEmail,
} from '../controllers/lead.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const leadRouter = Router();

// All routes require authentication
leadRouter.use(authenticate);

// CRUD operations
leadRouter.post('/', createLead);
leadRouter.get('/', getLeads);
leadRouter.get('/approved', requireRole('super_admin', 'accounts_manager'), getApprovedLeads);
leadRouter.get('/:id', getLeadById);
leadRouter.post('/:id/disbursement', requireRole('super_admin', 'accounts_manager'), addDisbursement);
leadRouter.put('/:id', updateLead);
leadRouter.delete('/:id', requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise', 'accounts_manager'), deleteLead);
leadRouter.put('/:id/status', updateLeadStatus);
leadRouter.post('/:id/forward-to-rm', requireRole('franchise'), forwardLeadToRM);

// Verification (Staff/Franchise Owner)
leadRouter.post('/:id/verify', requireRole('regional_manager', 'relationship_manager', 'franchise'), verifyLead);

// Document management
leadRouter.get('/:id/documents', getLeadDocuments);
leadRouter.post('/:id/documents', uploadLeadDocument);

// Version history (Agents can view their own leads, admins and franchise owners can view all)
leadRouter.get('/:id/history', getLeadHistory);

// Disbursement confirmation email endpoints - all roles except agent can access
leadRouter.get('/:id/disbursement-email/preview', requireRole('super_admin', 'relationship_manager', 'regional_manager', 'franchise', 'accounts_manager'), getDisbursementEmailPreview);
leadRouter.post('/:id/disbursement-email/send', requireRole('super_admin', 'relationship_manager', 'regional_manager', 'franchise', 'accounts_manager'), sendDisbursementEmail);

export default leadRouter;
