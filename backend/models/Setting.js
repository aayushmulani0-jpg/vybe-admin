const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  // Only one settings document should exist, so we use a constant ID or a singleton pattern
  singletonId: {
    type: String,
    default: 'global_settings',
    unique: true
  },
  themeColors: {
    primary: { type: String, default: '#000000' },
    secondary: { type: String, default: '#FFFFFF' },
    accent: { type: String, default: '#A3FF12' }
  },
  borderRadius: {
    button: { type: String, default: '0px' },
    popup: { type: String, default: '0.75rem' }
  },
  general: {
    storeName: { type: String, default: 'Vybe' },
    supportEmail: { type: String, default: 'support@vybe.com' },
    announcement: { type: String, default: '' }
  },
  customPrintColors: [{
    name: { type: String, required: true },
    hex: { type: String, required: true },
    isActive: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Setting', settingSchema);
