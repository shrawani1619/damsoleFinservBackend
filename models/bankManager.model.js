import mongoose from 'mongoose';

/**
 * Bank Manager Model
 * Bank managers (BM) have roles: SM, BM, or ASM. Each is associated with exactly one bank.
 */
const bankManagerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      sparse: true,
    },

    mobile: {
      type: String,
      sparse: true,
    },

    role: {
      type: String,
      enum: ['sm', 'bm', 'asm'],
      required: true,
      index: true,
    },

    bank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bank',
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  { timestamps: true }
);

bankManagerSchema.index({ bank: 1, status: 1 });

export default mongoose.model('BankManager', bankManagerSchema);
