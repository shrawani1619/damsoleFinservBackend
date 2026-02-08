import BankManager from '../models/bankManager.model.js';
import { getPaginationMeta } from '../utils/helpers.js';

export const createBankManager = async (req, res, next) => {
  try {
    const { name, email, mobile, role, bank, status } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Bank manager name is required',
      });
    }
    if (!role || !['sm', 'bm', 'asm'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role is required and must be sm, bm, or asm',
      });
    }
    if (!bank) {
      return res.status(400).json({
        success: false,
        message: 'Bank is required. Every bank manager must be associated with one bank.',
      });
    }

    const bankManager = await BankManager.create({
      name: name.trim(),
      email: email?.trim()?.toLowerCase() || undefined,
      mobile: mobile?.trim() || undefined,
      role: role.toLowerCase(),
      bank,
      status: status || 'active',
    });

    const populated = await BankManager.findById(bankManager._id).populate('bank', 'name type');

    res.status(201).json({
      success: true,
      message: 'Bank manager created successfully',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

export const getBankManagers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, role, bank } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (role) query.role = role.toLowerCase();
    if (bank) query.bank = bank;

    const bankManagers = await BankManager.find(query)
      .populate('bank', 'name type')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await BankManager.countDocuments(query);
    const pagination = getPaginationMeta(page, limit, total);

    res.status(200).json({
      success: true,
      data: bankManagers,
      pagination,
    });
  } catch (error) {
    next(error);
  }
};

export const getBankManagerById = async (req, res, next) => {
  try {
    const bankManager = await BankManager.findById(req.params.id).populate('bank', 'name type contactEmail');

    if (!bankManager) {
      return res.status(404).json({
        success: false,
        message: 'Bank manager not found',
      });
    }

    res.status(200).json({
      success: true,
      data: bankManager,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBankManager = async (req, res, next) => {
  try {
    const { name, email, mobile, role, bank, status } = req.body;
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name.trim();
    if (email !== undefined) updatePayload.email = email?.trim()?.toLowerCase() || null;
    if (mobile !== undefined) updatePayload.mobile = mobile?.trim() || null;
    if (role !== undefined) {
      if (!['sm', 'bm', 'asm'].includes(role?.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Role must be sm, bm, or asm',
        });
      }
      updatePayload.role = role.toLowerCase();
    }
    if (bank !== undefined) {
      if (!bank) {
        return res.status(400).json({
          success: false,
          message: 'Bank is required. Every bank manager must be associated with one bank.',
        });
      }
      updatePayload.bank = bank;
    }
    if (status !== undefined) updatePayload.status = status;

    const bankManager = await BankManager.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
      runValidators: true,
    }).populate('bank', 'name type');

    if (!bankManager) {
      return res.status(404).json({
        success: false,
        message: 'Bank manager not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank manager updated successfully',
      data: bankManager,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBankManagerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const bankManager = await BankManager.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('bank', 'name type');

    if (!bankManager) {
      return res.status(404).json({
        success: false,
        message: 'Bank manager not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank manager status updated',
      data: bankManager,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBankManager = async (req, res, next) => {
  try {
    const bankManager = await BankManager.findByIdAndDelete(req.params.id);

    if (!bankManager) {
      return res.status(404).json({
        success: false,
        message: 'Bank manager not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bank manager deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
