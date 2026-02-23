import mongoose from 'mongoose';

const formFieldSchema = new mongoose.Schema({
  key: { type: String, required: true }, // unique key used in formValues
  label: { type: String, required: true },
  type: { type: String, enum: ['text','number','date','select','textarea','email','tel','file'], required: true },
  required: { type: Boolean, default: false },
  options: [String], // for select
  validation: mongoose.Schema.Types.Mixed, // e.g., { min, max, regex }
  order: { type: Number, default: 0 },
});

const documentTypeSchema = new mongoose.Schema({
  key: { type: String, required: true },
  name: { type: String, required: true },
  required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
});

const leadFormSchema = new mongoose.Schema({
  leadType: {
    type: String,
    enum: ['bank', 'new_lead'],
    default: 'bank',
    index: true,
  },
  bank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bank',
    required: function () { return this.leadType === 'bank'; },
    index: { unique: true, sparse: true }, // sparse allows multiple nulls for new_lead
    default: null,
  },
  name: { type: String, default: 'Default Lead Form' },
  fields: [formFieldSchema], // legacy / fallback
  agentFields: [formFieldSchema], // fields shown ONLY to agents (Admin-configured)
  documentTypes: [documentTypeSchema],
  active: { type: Boolean, default: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

export default mongoose.model('LeadForm', leadFormSchema);

