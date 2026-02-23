import User from '../models/user.model.js';
import Accountant from '../models/accountant.model.js';
import { getPaginationMeta } from '../utils/helpers.js';
import auditService from '../services/audit.service.js';

/**
 * Get all accountant managers
 */
export const getAccountantManagers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const query = { role: 'accounts_manager' };
        if (status) query.status = status;

        const accountants = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await User.countDocuments(query);
        const pagination = getPaginationMeta(page, limit, total);

        res.status(200).json({
            success: true,
            data: accountants,
            pagination,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get accountant manager by ID
 */
export const getAccountantManagerById = async (req, res, next) => {
    try {
        const accountant = await User.findOne({ _id: req.params.id, role: 'accounts_manager' })
            .select('-password')
            .populate('createdBy', 'name email');

        if (!accountant) {
            return res.status(404).json({
                success: false,
                message: 'Accountant manager not found',
            });
        }

        // Get accountant profile with assigned Regional Managers
        const accountantProfile = await Accountant.findOne({ user: accountant._id })
            .populate('assignedRegionalManagers', 'name email mobile role')
            .select('assignedRegionalManagers department');

        const responseData = accountant.toObject();
        if (accountantProfile) {
            responseData.assignedRegionalManagers = accountantProfile.assignedRegionalManagers;
            responseData.department = accountantProfile.department;
        }

        res.status(200).json({
            success: true,
            data: responseData,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create accountant manager
 */
export const createAccountantManager = async (req, res, next) => {
    try {
        const userData = req.body;
        userData.role = 'accounts_manager';
        userData.createdBy = req.user._id;

        // Password is required for new users
        if (!userData.password) {
            return res.status(400).json({
                success: false,
                error: 'Password is required',
            });
        }

        // Check if email or mobile already exists
        const existingUser = await User.findOne({
            $or: [
                { email: userData.email?.toLowerCase() },
                { mobile: userData.mobile }
            ]
        });

        if (existingUser) {
            let duplicateField = '';
            if (existingUser.email?.toLowerCase() === userData.email?.toLowerCase()) {
                duplicateField = 'Email';
            } else if (existingUser.mobile === userData.mobile) {
                duplicateField = 'Mobile';
            }
            
            return res.status(400).json({
                success: false,
                error: `${duplicateField} already exists. Please use a different ${duplicateField.toLowerCase()}.`,
            });
        }

        const accountant = await User.create(userData);

        // Create Accountant profile in the new collection
        try {
            const accountantProfileData = {
                user: accountant._id,
                name: accountant.name,
                email: accountant.email,
                mobile: accountant.mobile,
                status: accountant.status,
                department: req.body.department || 'Finance'
            };

            // Add assigned Regional Managers if provided
            if (req.body.assignedRegionalManagers && Array.isArray(req.body.assignedRegionalManagers)) {
                accountantProfileData.assignedRegionalManagers = req.body.assignedRegionalManagers;
            }

            await Accountant.create(accountantProfileData);
        } catch (profileError) {
            console.error('⚠️ Could not create accountant profile:', profileError.message);
            // We don't fail the whole request if profile creation fails, 
            // but we log it.
        }

        // Log audit
        await auditService.logCreate(req.user._id, 'user', accountant._id, accountant.toObject(), req);

        const accountantResponse = await User.findById(accountant._id).select('-password');

        res.status(201).json({
            success: true,
            message: 'Accountant manager created successfully with dedicated profile',
            data: accountantResponse,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Update accountant manager
 */
export const updateAccountantManager = async (req, res, next) => {
    try {
        const accountant = await User.findOne({ _id: req.params.id, role: 'accounts_manager' });
        if (!accountant) {
            return res.status(404).json({
                success: false,
                message: 'Accountant manager not found',
            });
        }

        const previousValues = accountant.toObject();

        // Don't allow changing role through this endpoint
        delete req.body.role;

        const updatedAccountant = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password');

        // Sync Accountant profile
        try {
            const updateData = {
                name: updatedAccountant.name,
                email: updatedAccountant.email,
                mobile: updatedAccountant.mobile,
                status: updatedAccountant.status,
                ...(req.body.department && { department: req.body.department })
            };

            // Update assigned Regional Managers if provided
            if (req.body.assignedRegionalManagers !== undefined) {
                if (Array.isArray(req.body.assignedRegionalManagers)) {
                    updateData.assignedRegionalManagers = req.body.assignedRegionalManagers;
                }
            }

            await Accountant.findOneAndUpdate(
                { user: updatedAccountant._id },
                updateData,
                { upsert: true }
            );
        } catch (profileError) {
            console.error('⚠️ Could not sync accountant profile:', profileError.message);
        }

        // Log audit
        await auditService.logUpdate(req.user._id, 'user', updatedAccountant._id, previousValues, updatedAccountant.toObject(), req);

        res.status(200).json({
            success: true,
            message: 'Accountant manager updated successfully and profile synced',
            data: updatedAccountant,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete accountant manager
 */
export const deleteAccountantManager = async (req, res, next) => {
    try {
        const accountant = await User.findOne({ _id: req.params.id, role: 'accounts_manager' });
        if (!accountant) {
            return res.status(404).json({
                success: false,
                message: 'Accountant manager not found',
            });
        }

        const previousValues = accountant.toObject();
        await User.findByIdAndDelete(req.params.id);

        // Delete Accountant profile
        try {
            await Accountant.findOneAndDelete({ user: req.params.id });
        } catch (profileError) {
            console.error('⚠️ Could not delete accountant profile:', profileError.message);
        }

        // Log audit
        await auditService.logDelete(req.user._id, 'user', req.params.id, previousValues, req);

        res.status(200).json({
            success: true,
            message: 'Accountant manager and professional profile deleted successfully',
        });
    } catch (error) {
        next(error);
    }
};
