import FieldDefinition from '../models/fieldDefinition.model.js';

const DEFAULT_FIELDS = [
  // Personal details (first)
  { key: 'leadName', label: 'Lead Name', type: 'text', required: false, isSearchable: true, category: 'personal', order: 1 },
  { key: 'mobile', label: 'Mobile', type: 'tel', required: false, isSearchable: true, category: 'personal', order: 2 },
  { key: 'email', label: 'Email', type: 'email', required: false, isSearchable: true, category: 'personal', order: 3 },
  { key: 'address', label: 'Address', type: 'textarea', required: false, isSearchable: false, category: 'personal', order: 4 },
  // Bank details (second)
  { key: 'dsaCode', label: 'DSA Code', type: 'text', required: false, isSearchable: true, category: 'bank', order: 1 },
  { key: 'loanType', label: 'Loan Type', type: 'select', required: false, isSearchable: true, category: 'bank', order: 2, options: ['personal_loan', 'home_loan', 'business_loan', 'car_loan', 'education_loan', 'gold_loan', 'loan_against_property'] },
  { key: 'loanAmount', label: 'Loan Amount', type: 'number', required: false, isSearchable: true, category: 'bank', order: 3 },
  { key: 'branch', label: 'Branch', type: 'text', required: false, isSearchable: true, category: 'bank', order: 4 },
  { key: 'loanAccountNo', label: 'Loan Account No', type: 'text', required: false, isSearchable: true, category: 'bank', order: 5 },
];

/**
 * Seed default field definitions (Lead Name, Mobile, Email, Address) if they don't exist.
 */
export const seedFieldDefinitions = async () => {
  try {
    for (const field of DEFAULT_FIELDS) {
      const existing = await FieldDefinition.findOne({ key: field.key });
      if (!existing) {
        await FieldDefinition.create(field);
        console.log('✅ Seeded field definition:', field.label);
      } else if (!existing.category) {
        existing.category = field.category;
        existing.order = field.order;
        await existing.save();
      }
    }
  } catch (error) {
    console.error('❌ Error seeding field definitions:', error.message);
  }
};

