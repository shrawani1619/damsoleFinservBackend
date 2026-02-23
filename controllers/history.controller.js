import AuditLog from '../models/auditLog.model.js';
import { getPaginationMeta } from '../utils/helpers.js';

/**
 * Get All History (Admin Only)
 * Returns all audit logs with pagination
 */
export const getAllHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, action, entityType, startDate, endDate } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    if (action) {
      query.action = action;
    }

    if (entityType) {
      query.entityType = entityType;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    // Fetch audit logs with pagination
    const logs = await AuditLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await AuditLog.countDocuments(query);

    const paginationMeta = getPaginationMeta(total, pageNum, limitNum);

    res.status(200).json({
      success: true,
      data: logs,
      pagination: paginationMeta,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get History Statistics
 * Returns summary statistics about history/audit logs
 */
export const getHistoryStats = async (req, res, next) => {
  try {
    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const entityStats = await AuditLog.aggregate([
      {
        $group: {
          _id: '$entityType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    const totalLogs = await AuditLog.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        actionStats: stats,
        entityStats,
      },
    });
  } catch (error) {
    next(error);
  }
};

