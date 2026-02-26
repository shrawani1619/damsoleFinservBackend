import { Router } from 'express';
import { createAgent, getAgents, getAgentById, updateAgent, updateAgentStatus, deleteAgent, createSubAgent, getSubAgents, getSubAgentById, updateSubAgent, deleteSubAgent } from '../controllers/agent.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';
const agentRouter = Router();

// Sub-agent routes (for agents and super_admin) - define BEFORE generic '/:id' routes
// so that '/sub-agents' does not get captured by '/:id'.
agentRouter.post('/sub-agents', authenticate, requireRole('agent'), createSubAgent);
agentRouter.get('/sub-agents', authenticate, requireRole('agent', 'super_admin'), getSubAgents);
agentRouter.get('/sub-agents/:id', authenticate, requireRole('agent', 'super_admin'), getSubAgentById);
agentRouter.put('/sub-agents/:id', authenticate, requireRole('agent', 'super_admin'), updateSubAgent);
agentRouter.delete('/sub-agents/:id', authenticate, requireRole('agent', 'super_admin'), deleteSubAgent);

// Regular agent routes
agentRouter.post('/', authenticate, createAgent);
// Allow admin-type roles and agents to load agent list/details.
agentRouter.get('/', authenticate, requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise', 'accounts_manager', 'agent'), getAgents);
agentRouter.get('/:id', authenticate, requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise', 'accounts_manager', 'agent'), getAgentById);
agentRouter.put('/:id', authenticate, requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), updateAgent);
agentRouter.delete('/:id', authenticate, requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), deleteAgent);
agentRouter.put('/:id/status', authenticate, requireRole('super_admin', 'regional_manager', 'relationship_manager', 'franchise'), updateAgentStatus);

export default agentRouter;