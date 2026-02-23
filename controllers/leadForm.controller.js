import LeadForm from '../models/leadForm.model.js';
import FieldDefinition from '../models/fieldDefinition.model.js';

export const createLeadForm = async (req, res, next) => {
  try {
    const { bank, name, fields = [], agentFields = [], documentTypes = [], active = true, leadType = 'bank' } = req.body;

    if (leadType === 'bank') {
      if (!bank) {
        return res.status(400).json({ success: false, error: 'Bank id is required for bank lead forms' });
      }
    }

    // For new_lead: only one generic form; for bank: one form per bank
    const query = leadType === 'new_lead' ? { leadType: 'new_lead' } : { bank };
    let leadForm = await LeadForm.findOne(query);

    const payload = {
      leadType: leadType === 'new_lead' ? 'new_lead' : 'bank',
      bank: leadType === 'new_lead' ? null : bank,
      name: name || (leadType === 'new_lead' ? 'New Lead Form' : 'Lead Form'),
      fields: agentFields.length > 0 ? agentFields : fields, // backward compat
      agentFields: agentFields.length > 0 ? agentFields : fields,
      documentTypes,
      active,
      createdBy: req.user?._id,
    };

    if (leadForm) {
      leadForm.name = payload.name;
      leadForm.fields = payload.fields;
      leadForm.agentFields = payload.agentFields;
      leadForm.documentTypes = payload.documentTypes;
      leadForm.active = payload.active;
      leadForm.createdBy = payload.createdBy;
      await leadForm.save();
    } else {
      leadForm = await LeadForm.create(payload);
    }

    res.status(201).json({ success: true, data: leadForm });
  } catch (error) {
    next(error);
  }
};

export const updateLeadForm = async (req, res, next) => {
  try {
    const updated = await LeadForm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, error: 'LeadForm not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/** Convert FieldDefinition to form field shape */
const defToFormField = (d) => ({
  key: d.key,
  label: d.label || d.key,
  type: d.type || 'text',
  required: !!d.required,
  options: Array.isArray(d.options) ? d.options : [],
  order: d.order || 0,
});

export const getLeadFormByBank = async (req, res, next) => {
  try {
    const bankId = req.params.bankId || req.query.bankId;
    if (!bankId) return res.status(400).json({ success: false, error: 'bankId is required' });
    const leadForm = await LeadForm.findOne({ bank: bankId, leadType: 'bank', active: true });
    if (!leadForm) return res.status(200).json({ success: true, data: null });

    const userRole = req.user?.role || '';
    let fieldsToReturn;

    if (userRole === 'agent') {
      fieldsToReturn = (leadForm.agentFields && leadForm.agentFields.length > 0)
        ? leadForm.agentFields
        : (leadForm.fields || []);
    } else {
      const allDefs = await FieldDefinition.find().sort({ category: 1, order: 1, key: 1 });
      fieldsToReturn = allDefs.map(defToFormField);
    }

    const data = leadForm.toObject();
    data.fields = fieldsToReturn;
    data.agentFields = leadForm.agentFields || leadForm.fields || []; // always include for Lead Form Builder
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const getNewLeadForm = async (req, res, next) => {
  try {
    const leadForm = await LeadForm.findOne({ leadType: 'new_lead', active: true });
    if (!leadForm) return res.status(200).json({ success: true, data: null });

    const userRole = req.user?.role || '';
    let fieldsToReturn;

    if (userRole === 'agent') {
      fieldsToReturn = (leadForm.agentFields && leadForm.agentFields.length > 0)
        ? leadForm.agentFields
        : (leadForm.fields || []);
    } else {
      const allDefs = await FieldDefinition.find().sort({ category: 1, order: 1, key: 1 });
      fieldsToReturn = allDefs.map(defToFormField);
    }

    const data = leadForm.toObject();
    data.fields = fieldsToReturn;
    data.agentFields = leadForm.agentFields || leadForm.fields || []; // always include for Lead Form Builder
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const listLeadForms = async (req, res, next) => {
  try {
    const forms = await LeadForm.find().populate('bank', 'name');
    res.status(200).json({ success: true, data: forms });
  } catch (error) {
    next(error);
  }
};

