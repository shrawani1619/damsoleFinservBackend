import FieldDefinition from '../models/fieldDefinition.model.js';

const CATEGORY_ORDER = { personal: 0, bank: 1, other: 2 };

export const listFieldDefinitions = async (req, res, next) => {
  try {
    const defs = await FieldDefinition.find();
    defs.sort((a, b) => {
      const catA = CATEGORY_ORDER[a.category] ?? 2;
      const catB = CATEGORY_ORDER[b.category] ?? 2;
      if (catA !== catB) return catA - catB;
      return (a.order || 0) - (b.order || 0) || (a.key || '').localeCompare(b.key || '');
    });
    res.status(200).json({ success: true, data: defs });
  } catch (err) {
    next(err);
  }
};

export const createFieldDefinition = async (req, res, next) => {
  try {
    const { key, label, type, required = false, isSearchable = false, options = [], category = 'other', order = 0 } = req.body;
    if (!key || !label) {
      return res.status(400).json({ success: false, error: 'Key and label are required' });
    }
    // Normalize key
    const normKey = key.trim();
    let existing = await FieldDefinition.findOne({ key: normKey });
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }
    const def = await FieldDefinition.create({
      key: normKey,
      label: label.trim(),
      type,
      required,
      isSearchable,
      options: Array.isArray(options) ? options : [],
      category: ['personal', 'bank', 'other'].includes(category) ? category : 'other',
      order: typeof order === 'number' ? order : 0,
      createdBy: req.user?._id,
    });
    res.status(201).json({ success: true, data: def });
  } catch (err) {
    next(err);
  }
};

