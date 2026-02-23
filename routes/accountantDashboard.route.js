import { Router } from 'express';
import { 
  getApprovedLeads,
  getApprovedLeadDetails,
  addDisbursement,
  getDisbursementHistory,
  getDashboardSummary,
  getCommissionReport,
  editDisbursement,
  deleteDisbursement,
  updateLeadStatus,
  addLeadNote
} from '../controllers/accountantDashboard.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
import { validateRequired } from '../middlewares/validation.middleware.js';

const accountantRouter = Router();

// All routes require authentication and accounts_manager role
accountantRouter.use(authenticate);
accountantRouter.use(requireRole('accounts_manager'));

// 5️⃣ Accountant Dashboard Summary
accountantRouter.get('/dashboard', getDashboardSummary);

// 1️⃣ Get Approved Leads (Accountant Only)
accountantRouter.get('/leads', getApprovedLeads);

// 2️⃣ Get Single Approved Lead Details
accountantRouter.get('/leads/:id', getApprovedLeadDetails);

// 3️⃣ Add Disbursement
accountantRouter.post('/disbursements/:id', 
  validateRequired(['amount', 'date', 'utr']),
  addDisbursement
);

// 4️⃣ Get Disbursement History
accountantRouter.get('/disbursements/:id/history', getDisbursementHistory);

// 6️⃣ Commission Report API
accountantRouter.get('/reports/commission', getCommissionReport);

// 7️⃣ Edit Disbursement Entry
accountantRouter.put('/disbursements/:leadId/:disbursementId', 
  validateRequired(['amount']), // At least amount is required for edit
  editDisbursement
);

// 8️⃣ Delete Disbursement Entry
accountantRouter.delete('/disbursements/:leadId/:disbursementId', deleteDisbursement);

// 9️⃣ Update Lead Status
accountantRouter.patch('/leads/:id/status', 
  validateRequired(['status']),
  updateLeadStatus
);

// 🔟 Add Note to Lead
accountantRouter.post('/leads/:id/notes', 
  validateRequired(['note']),
  addLeadNote
);

export default accountantRouter;