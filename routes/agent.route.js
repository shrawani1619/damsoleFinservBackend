import { Router } from 'express';
import { createAgent, getAgents, getAgentById, updateAgent, updateAgentStatus, deleteAgent } from '../controllers/agent.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
const agentRouter = Router();

agentRouter.post('/', authenticate, createAgent);
agentRouter.get('/', authenticate, requireRole('super_admin', 'relationship_manager', 'franchise_manager', 'franchise_owner'), getAgents);
agentRouter.get('/:id', authenticate, requireRole('super_admin', 'relationship_manager', 'franchise_manager', 'franchise_owner'), getAgentById);
agentRouter.put('/:id', authenticate, requireRole('super_admin', 'relationship_manager', 'franchise_manager', 'franchise_owner'), updateAgent);
agentRouter.delete('/:id', authenticate, requireRole('super_admin', 'relationship_manager', 'franchise_owner'), deleteAgent);
agentRouter.put('/:id/status', authenticate, requireRole('super_admin', 'relationship_manager', 'franchise_manager', 'franchise_owner'), updateAgentStatus);


export default agentRouter;