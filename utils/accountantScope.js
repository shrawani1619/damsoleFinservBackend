import Accountant from '../models/accountant.model.js';
import User from '../models/user.model.js';
import Franchise from '../models/franchise.model.js';
import RelationshipManager from '../models/relationship.model.js';

/**
 * Get assigned Regional Manager IDs for an Accountant
 * @param {Object} req - Express request with req.user
 * @returns {Promise<import('mongoose').Types.ObjectId[] | null>}
 */
export async function getAccountantAssignedRegionalManagerIds(req) {
  if (!req.user || req.user.role !== 'accounts_manager') return null;
  
  try {
    // Find the accountant profile
    const accountant = await Accountant.findOne({ user: req.user._id }).select('assignedRegionalManagers');
    if (!accountant || !accountant.assignedRegionalManagers || accountant.assignedRegionalManagers.length === 0) {
      return [];
    }
    return accountant.assignedRegionalManagers.map(rm => {
      // Handle both ObjectId and string
      return rm.toString ? rm.toString() : String(rm);
    });
  } catch (error) {
    console.error('Error getting assigned RMs for accountant:', error);
    return [];
  }
}

/**
 * Get all user IDs (agents, relationship managers, franchise) under assigned Regional Managers
 * @param {Object} req - Express request with req.user
 * @returns {Promise<{agentIds: string[], relationshipManagerIds: string[], franchiseIds: string[], regionalManagerIds: string[]}>}
 */
export async function getAccountantAccessibleUserIds(req) {
  if (!req.user || req.user.role !== 'accounts_manager') {
    return {
      agentIds: [],
      relationshipManagerIds: [],
      franchiseIds: [],
      regionalManagerIds: []
    };
  }

  try {
    const rmIds = await getAccountantAssignedRegionalManagerIds(req);
    
    if (!rmIds || rmIds.length === 0) {
      return {
        agentIds: [],
        relationshipManagerIds: [],
        franchiseIds: [],
        regionalManagerIds: []
      };
    }

    // Get franchises under these RMs
    const franchiseIds = await Franchise.find({ 
      regionalManager: { $in: rmIds } 
    }).distinct('_id');
    const franchiseIdStrings = franchiseIds.map(id => id.toString());

    // Get Relationship Managers under these RMs
    const relationshipManagers = await RelationshipManager.find({ 
      regionalManager: { $in: rmIds } 
    }).select('_id owner');
    const relationshipManagerIds = relationshipManagers.map(rm => rm._id.toString());
    const relationshipManagerOwnerIds = relationshipManagers
      .filter(rm => rm.owner)
      .map(rm => rm.owner.toString());

    // Get agents under these RMs (through franchises and relationship managers)
    const agentQuery = {
      role: 'agent',
      $or: [
        { managedByModel: 'Franchise', managedBy: { $in: franchiseIds } },
        { managedByModel: 'RelationshipManager', managedBy: { $in: relationshipManagerIds } }
      ]
    };
    const agents = await User.find(agentQuery).select('_id');
    const agentIds = agents.map(agent => agent._id.toString());

    // Get franchise owner user IDs
    const franchiseOwners = await User.find({
      role: 'franchise',
      franchiseOwned: { $in: franchiseIds }
    }).select('_id');
    const franchiseOwnerIds = franchiseOwners.map(owner => owner._id.toString());

    return {
      agentIds,
      relationshipManagerIds: relationshipManagerOwnerIds,
      franchiseIds: franchiseOwnerIds,
      regionalManagerIds: rmIds
    };
  } catch (error) {
    console.error('Error getting accessible user IDs for accountant:', error);
    return {
      agentIds: [],
      relationshipManagerIds: [],
      franchiseIds: [],
      regionalManagerIds: []
    };
  }
}

/**
 * Get all agent IDs under assigned Regional Managers
 * @param {Object} req - Express request with req.user
 * @returns {Promise<string[]>}
 */
export async function getAccountantAccessibleAgentIds(req) {
  const { agentIds } = await getAccountantAccessibleUserIds(req);
  return agentIds;
}

/**
 * Get all Relationship Manager user IDs under assigned Regional Managers
 * @param {Object} req - Express request with req.user
 * @returns {Promise<string[]>}
 */
export async function getAccountantAccessibleRelationshipManagerIds(req) {
  const { relationshipManagerIds } = await getAccountantAccessibleUserIds(req);
  return relationshipManagerIds;
}

/**
 * Get all Franchise user IDs under assigned Regional Managers
 * @param {Object} req - Express request with req.user
 * @returns {Promise<string[]>}
 */
export async function getAccountantAccessibleFranchiseIds(req) {
  const { franchiseIds } = await getAccountantAccessibleUserIds(req);
  return franchiseIds;
}

/**
 * Check if accountant can access a lead (by checking if lead's agent is in accessible users)
 * @param {Object} req - Express request
 * @param {Object} lead - Lead document
 * @returns {Promise<boolean>}
 */
export async function accountantCanAccessLead(req, lead) {
  if (!req.user || req.user.role !== 'accounts_manager') return true;
  
  const { agentIds } = await getAccountantAccessibleUserIds(req);
  if (agentIds.length === 0) return false;
  
  const leadAgentId = lead.agent?.toString() || lead.agent;
  return agentIds.includes(leadAgentId);
}

