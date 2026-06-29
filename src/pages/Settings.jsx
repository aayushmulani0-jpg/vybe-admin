import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useUIStore } from '../store/useUIStore';
import GlassCard from '../components/common/GlassCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Save, Settings2, LayoutTemplate, Type, Palette } from 'lucide-react';

export default function Settings() {
  const { settings, fetchSettings, updateSettings, isLoading } = useSettingsStore();
  const { alert, confirm } = useUIStore();
  const [activeTab, setActiveTab] = useState('theme');
  const [formData, setFormData] = useState({
    themeColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#A3FF12' },
    borderRadius: { button: '0px', popup: '0.75rem' },
    general: { storeName: 'Vybe', supportEmail: 'support@vybe.com', announcement: '' }
  });

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleNestedChange = (category, field, value) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    const success = await updateSettings(formData);
    if (success) {
      alert('Settings updated successfully! Changes will reflect on the client storefront immediately.', 'success', 'Saved');
    } else {
      alert('Failed to update settings.', 'error', 'Error');
    }
  };

  const handleRestoreDefaults = async () => {
    confirm({
      title: 'Restore Defaults',
      message: 'Are you sure you want to restore all settings to their default values? This will immediately apply to the storefront.',
      confirmText: 'Restore',
      onConfirm: async () => {
        const defaults = {
          themeColors: { primary: '#000000', secondary: '#FFFFFF', accent: '#A3FF12' },
          borderRadius: { button: '0px', popup: '0.75rem' },
          general: { storeName: 'Vybe', supportEmail: 'support@vybe.com', announcement: '' }
        };
        
        const success = await updateSettings(defaults);
        if (success) {
          setFormData(defaults);
          alert('Settings restored to defaults.', 'success', 'Restored');
        } else {
          alert('Failed to restore settings.', 'error', 'Error');
        }
      }
    });
  };

  if (isLoading && !settings) {
    return <div className="text-white">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Global Settings</h1>
        <p className="text-sm text-gray-400">Configure theme colors, border radii, and store details for the storefront.</p>
      </div>

      <div className="flex gap-4 border-b border-vybe-glassBorder mb-6">
        <button
          onClick={() => setActiveTab('theme')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'theme' ? 'border-vybe-neon text-vybe-neon' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2"><Palette className="w-4 h-4" /> Theme Colors</div>
        </button>
        <button
          onClick={() => setActiveTab('ui')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'ui' ? 'border-vybe-neon text-vybe-neon' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2"><LayoutTemplate className="w-4 h-4" /> UI & Styling</div>
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 px-1 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'general' ? 'border-vybe-neon text-vybe-neon' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> General Info</div>
        </button>
      </div>

      <GlassCard className="p-6">
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Storefront Colors</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Primary Background</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeColors?.primary || '#000000'}
                    onChange={(e) => handleNestedChange('themeColors', 'primary', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.themeColors?.primary || '#000000'}
                    onChange={(e) => handleNestedChange('themeColors', 'primary', e.target.value)}
                    className="bg-vybe-dark border border-vybe-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vybe-neon font-mono text-sm uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Secondary / Text Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeColors?.secondary || '#FFFFFF'}
                    onChange={(e) => handleNestedChange('themeColors', 'secondary', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.themeColors?.secondary || '#FFFFFF'}
                    onChange={(e) => handleNestedChange('themeColors', 'secondary', e.target.value)}
                    className="bg-vybe-dark border border-vybe-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vybe-neon font-mono text-sm uppercase"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Accent / Highlight Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.themeColors?.accent || '#A3FF12'}
                    onChange={(e) => handleNestedChange('themeColors', 'accent', e.target.value)}
                    className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                  <input
                    type="text"
                    value={formData.themeColors?.accent || '#A3FF12'}
                    onChange={(e) => handleNestedChange('themeColors', 'accent', e.target.value)}
                    className="bg-vybe-dark border border-vybe-glassBorder rounded-lg px-3 py-2 text-white focus:outline-none focus:border-vybe-neon font-mono text-sm uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ui' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Border Radius</h3>
            <p className="text-sm text-gray-400 mb-4">Use CSS values like <code className="text-vybe-neon bg-white/5 px-1 rounded">0px</code>, <code className="text-vybe-neon bg-white/5 px-1 rounded">8px</code>, <code className="text-vybe-neon bg-white/5 px-1 rounded">0.5rem</code>, or <code className="text-vybe-neon bg-white/5 px-1 rounded">9999px</code> (for pill shape).</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Button Border Radius"
                value={formData.borderRadius?.button || '0px'}
                onChange={(e) => handleNestedChange('borderRadius', 'button', e.target.value)}
                placeholder="e.g. 0px or 9999px"
              />
              <Input
                label="Popup/Modal Border Radius"
                value={formData.borderRadius?.popup || '0.75rem'}
                onChange={(e) => handleNestedChange('borderRadius', 'popup', e.target.value)}
                placeholder="e.g. 1rem or 0px"
              />
            </div>

            <div className="mt-8 p-6 bg-vybe-dark border border-vybe-glassBorder rounded-xl">
              <h4 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Live Preview</h4>
              <div className="flex items-center gap-4">
                <button
                  className="px-6 py-3 font-semibold uppercase tracking-widest text-sm transition-all"
                  style={{
                    backgroundColor: formData.themeColors?.accent || '#A3FF12',
                    color: formData.themeColors?.primary || '#000000',
                    borderRadius: formData.borderRadius?.button || '0px'
                  }}
                >
                  Sample Button
                </button>
                <div 
                  className="px-6 py-4 border border-vybe-glassBorder flex items-center justify-center text-sm font-medium"
                  style={{
                    backgroundColor: formData.themeColors?.primary || '#000000',
                    color: formData.themeColors?.secondary || '#FFFFFF',
                    borderRadius: formData.borderRadius?.popup || '0.75rem'
                  }}
                >
                  Sample Popup / Card
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-white mb-4">Store Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Store Name"
                value={formData.general?.storeName || ''}
                onChange={(e) => handleNestedChange('general', 'storeName', e.target.value)}
              />
              <Input
                label="Support Email"
                value={formData.general?.supportEmail || ''}
                onChange={(e) => handleNestedChange('general', 'supportEmail', e.target.value)}
              />
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-2">Announcement / Notice Bar</label>
                <textarea
                  value={formData.general?.announcement || ''}
                  onChange={(e) => handleNestedChange('general', 'announcement', e.target.value)}
                  placeholder="Enter a message. For a scrolling marquee with multiple notices, enter each on a new line."
                  className="w-full bg-vybe-dark border border-vybe-glassBorder rounded-lg px-4 py-3 text-white focus:outline-none focus:border-vybe-neon transition-colors resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-2">This will appear on all pages of the storefront. If you enter multiple lines, it will scroll like a marquee.</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-vybe-glassBorder flex justify-between items-center">
          <button 
            onClick={handleRestoreDefaults}
            className="text-gray-400 hover:text-white text-sm underline transition-colors"
          >
            Restore Defaults
          </button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" /> Save Settings
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
