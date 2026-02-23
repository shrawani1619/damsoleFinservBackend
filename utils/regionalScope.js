import Franchise from '../models/franchise.model.js';

/**
 * Get franchise IDs the current user can access as regional_manager.
 * Returns array of ObjectIds if user is regional_manager, otherwise null.
 * @param {Object} req - Express request with req.user
 * @returns {Promise<import('mongoose').Types.ObjectId[] | null>}
 */
export async function getRegionalManagerFranchiseIds(req) {
  if (!req.user || req.user.role !== 'regional_manager') return null;
  const ids = await Franchise.find({ regionalManager: req.user._id }).distinct('_id');
  return ids.length ? ids : [];
}

/**
 * Get Relationship Manager IDs the current user can access as regional_manager.
 * Returns array of ObjectIds if user is regional_manager, otherwise null.
 * @param {Object} req - Express request with req.user
 * @returns {Promise<import('mongoose').Types.ObjectId[] | null>}
 */
export async function getRegionalManagerRelationshipManagerIds(req) {
  if (!req.user || req.user.role !== 'regional_manager') return null;
  const RelationshipManager = await import('../models/relationship.model.js').then(m => m.default).catch(() => null);
  if (!RelationshipManager) return null;
  const ids = await RelationshipManager.find({ regionalManager: req.user._id }).distinct('_id');
  return ids.length ? ids : [];
}

/**
 * Check if regional_manager can access a franchise by ID.
 * @param {Object} req - Express request
 * @param {string|import('mongoose').Types.ObjectId} franchiseId
 * @returns {Promise<boolean>}
 */
export async function regionalManagerCanAccessFranchise(req, franchiseId) {
  const ids = await getRegionalManagerFranchiseIds(req);
  if (ids === null) return true; // not regional_manager
  const id = franchiseId && (franchiseId.toString?.() || franchiseId);
  return ids.some((fid) => fid.toString() === id);
}

/**
 * Check if regional_manager can access a Relationship Manager by ID.
 * @param {Object} req - Express request
 * @param {string|import('mongoose').Types.ObjectId} relationshipManagerId
 * @returns {Promise<boolean>}
 */
export async function regionalManagerCanAccessRelationshipManager(req, relationshipManagerId) {
  const ids = await getRegionalManagerRelationshipManagerIds(req);
  if (ids === null) return true; // not regional_manager
  const id = relationshipManagerId && (relationshipManagerId.toString?.() || relationshipManagerId);
  return ids.some((rmId) => rmId.toString() === id);
}
