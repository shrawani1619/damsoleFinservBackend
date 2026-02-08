import { Router } from 'express';
import {
  createRelationshipManager,
  getRelationshipManagers,
  getRelationshipManagerById,
  updateRelationshipManager,
  updateRelationshipManagerStatus,
  getRelationshipManagerFranchises,
  getRelationshipManagerPerformance,
  deleteRelationshipManager,
} from '../controllers/relationshipManager.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const relationshipManagerRouter = Router();

relationshipManagerRouter.use(authenticate);

relationshipManagerRouter.post('/', requireRole('super_admin', 'regional_manager'), createRelationshipManager);
relationshipManagerRouter.get('/', getRelationshipManagers);
relationshipManagerRouter.get('/:id', getRelationshipManagerById);
relationshipManagerRouter.put('/:id', requireRole('super_admin', 'regional_manager'), updateRelationshipManager);
relationshipManagerRouter.delete('/:id', requireRole('super_admin', 'regional_manager'), deleteRelationshipManager);
relationshipManagerRouter.put('/:id/status', requireRole('super_admin', 'regional_manager'), updateRelationshipManagerStatus);
relationshipManagerRouter.get('/:id/franchises', requireRole('super_admin', 'regional_manager'), getRelationshipManagerFranchises);
relationshipManagerRouter.get('/:id/performance', requireRole('super_admin', 'regional_manager'), getRelationshipManagerPerformance);

export default relationshipManagerRouter;
