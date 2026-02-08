import { Router } from 'express';
import {
  getAgentDashboard,
  getStaffDashboard,
  getAccountsDashboard,
  getAdminDashboard,
  getFranchiseOwnerDashboard,
  getRelationshipManagerDashboard,
} from '../controllers/dashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const dashboardRouter = Router();

// All routes require authentication
dashboardRouter.use(authenticate);

// Role-based dashboards
dashboardRouter.get('/agent', requireRole('agent'), getAgentDashboard);
dashboardRouter.get('/staff', requireRole('relationship_manager'), getRelationshipManagerDashboard);
dashboardRouter.get('/accounts', requireRole('accounts_manager'), getAccountsDashboard);
dashboardRouter.get('/admin', requireRole('super_admin', 'regional_manager'), getAdminDashboard);
dashboardRouter.get('/franchise', requireRole('franchise'), getFranchiseOwnerDashboard);

export default dashboardRouter;
