import mongoose from 'mongoose';

const fieldDefinitionSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  label: { type: String, required: true, trim: true },
  type: { type: String, enum: ['text','number','date','select','file','email','tel','textarea'], default: 'text' },
  required: { type: Boolean, default: false },
  isSearchable: { type: Boolean, default: false },
  options: [String],
  category: { type: String, enum: ['personal', 'bank', 'other'], default: 'other' },
  order: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

export default mongoose.model('FieldDefinition', fieldDefinitionSchema);

