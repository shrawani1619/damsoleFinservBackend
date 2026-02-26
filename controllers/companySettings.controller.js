import CompanySettings from '../models/companySettings.model.js';

/**
 * Get company settings
 */
export const getCompanySettings = async (req, res, next) => {
  try {
    const settings = await CompanySettings.getSettings();
    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update company settings (Admin only)
 */
export const updateCompanySettings = async (req, res, next) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Only Admin can update company settings.',
      });
    }

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create(req.body);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(
        settings._id,
        req.body,
        { new: true, runValidators: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Company settings updated successfully',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

