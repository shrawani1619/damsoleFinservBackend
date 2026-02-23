import mongoose from 'mongoose';

/**
 * Accountant Model
 * Dedicated collection for accountant-specific details.
 * Authentication is typically managed via the User model with role 'accounts_manager'.
 */
const accountantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            index: true,
        },

        mobile: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        employeeId: {
            type: String,
            unique: true,
            sparse: true,
        },

        department: {
            type: String,
            default: 'Finance',
        },

        qualification: {
            type: String,
        },

        experience: {
            type: Number, // in years
            default: 0,
        },

        assignedBanks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Bank',
            },
        ],

        // Regional Managers assigned to this Accountant
        assignedRegionalManagers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                index: true,
            },
        ],

        status: {
            type: String,
            enum: ['active', 'inactive', 'blocked'],
            default: 'active',
            index: true,
        },

        lastLoginAt: Date,

        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },

        // Reference to the main User document for auth/linking
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            index: true,
        },

        performanceMetrics: {
            totalDisbursementsProcessed: {
                type: Number,
                default: 0,
            },
            totalAmountDisbursed: {
                type: Number,
                default: 0,
            },
            lastUpdated: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model('Accountant', accountantSchema);
