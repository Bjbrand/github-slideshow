import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Settings, ArrowLeft, Save, Sparkles } from 'lucide-react';

export default function AdminSettings() {
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const seasonalTemplates = {
    "Black Friday": {
      discount: 30,
      banner: "🎉 BLACK FRIDAY MEGA SALE - 30% OFF ALL SERVICES!",
      primary: "#000000",
      accent: "#ff6b00"
    },
    "Christmas": {
      discount: 25,
      banner: "🎄 CHRISTMAS SPECIAL - Unwrap 25% Savings!",
      primary: "#c41e3a",
      accent: "#0f8a5f"
    },
    "New Year": {
      discount: 20,
      banner: "🎊 NEW YEAR PROMOTION - Start Fresh with 20% OFF!",
      primary: "#ffd700",
      accent: "#4169e1"
    },
    "Valentine's": {
      discount: 15,
      banner: "💝 VALENTINE'S DAY - Share the Love with 15% OFF!",
      primary: "#ff1493",
      accent: "#ff69b4"
    },
    "Easter": {
      discount: 20,
      banner: "🐣 EASTER SPECIAL - Hop into 20% Savings!",
      primary: "#9370db",
      accent: "#ffb6c1"
    },
    "Summer": {
      discount: 15,
      banner: "☀️ SUMMER VIBES - Cool Down with 15% OFF!",
      primary: "#ff6347",
      accent: "#ffa500"
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API}/admin/settings`, settings, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const applySeasonalTemplate = (templateName) => {
    const template = seasonalTemplates[templateName];
    setSettings({
      ...settings,
      seasonal_campaign: {
        active: true,
        name: templateName,
        discount_percentage: template.discount,
        banner_text: template.banner,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      },
      theme: {
        ...settings.theme,
        primary_color: template.primary,
        accent_color: template.accent
      }
    });
    toast.success(`${templateName} template applied!`);
  };

  const updatePricing = (service, value) => {
    setSettings({
      ...settings,
      pricing: {
        ...settings.pricing,
        [service]: parseInt(value) || 0
      }
    });
  };

  const updateTheme = (field, value) => {
    setSettings({
      ...settings,
      theme: {
        ...settings.theme,
        [field]: value
      }
    });
  };

  const updateCampaign = (field, value) => {
    setSettings({
      ...settings,
      seasonal_campaign: {
        ...settings.seasonal_campaign,
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white/70 hover:text-white"
              data-testid="settings-back-btn"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#003366] hover:bg-[#004080] text-white"
              data-testid="settings-save-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Settings</h1>
          <p className="text-[#a1a1aa]">Customize pricing, themes, and seasonal campaigns</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pricing Settings */}
          <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Service Pricing (TZS)
            </h2>
            <div className="space-y-4">
              {Object.keys(settings.pricing).map(service => (
                <div key={service}>
                  <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                    {service}
                  </Label>
                  <Input
                    type="number"
                    value={settings.pricing[service]}
                    onChange={(e) => updatePricing(service, e.target.value)}
                    className="bg-black/20 border-white/10 text-white h-10"
                    data-testid={`price-${service.toLowerCase().replace(' ', '-')}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-[#121212] border border-white/5 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Theme Customization</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  Primary Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={settings.theme.primary_color}
                    onChange={(e) => updateTheme('primary_color', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.theme.primary_color}
                    onChange={(e) => updateTheme('primary_color', e.target.value)}
                    className="bg-black/20 border-white/10 text-white h-10 flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  Secondary Color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={settings.theme.secondary_color}
                    onChange={(e) => updateTheme('secondary_color', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.theme.secondary_color}
                    onChange={(e) => updateTheme('secondary_color', e.target.value)}
                    className="bg-black/20 border-white/10 text-white h-10 flex-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  Hero Text
                </Label>
                <Input
                  type="text"
                  value={settings.theme.hero_text}
                  onChange={(e) => updateTheme('hero_text', e.target.value)}
                  className="bg-black/20 border-white/10 text-white h-10"
                />
              </div>

              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  Hero Subtitle
                </Label>
                <Textarea
                  value={settings.theme.hero_subtitle}
                  onChange={(e) => updateTheme('hero_subtitle', e.target.value)}
                  className="bg-black/20 border-white/10 text-white min-h-20"
                />
              </div>
            </div>
          </div>

          {/* Seasonal Campaign */}
          <div className="bg-[#121212] border border-white/5 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Seasonal Campaign
            </h2>

            {/* Quick Templates */}
            <div className="mb-6">
              <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-3 block">
                Quick Templates
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.keys(seasonalTemplates).map(template => (
                  <Button
                    key={template}
                    onClick={() => applySeasonalTemplate(template)}
                    variant="outline"
                    className="bg-white/5 border-white/10 hover:bg-white/10 text-white text-sm"
                    data-testid={`template-${template.toLowerCase()}`}
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={settings.seasonal_campaign.active}
                    onChange={(e) => updateCampaign('active', e.target.checked)}
                    className="w-5 h-5"
                    data-testid="campaign-active-checkbox"
                  />
                  <Label className="text-white">Activate Campaign</Label>
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                    Campaign Name
                  </Label>
                  <Input
                    type="text"
                    value={settings.seasonal_campaign.name}
                    onChange={(e) => updateCampaign('name', e.target.value)}
                    className="bg-black/20 border-white/10 text-white h-10"
                    placeholder="e.g., Black Friday Sale"
                  />
                </div>

                <div>
                  <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                    Discount Percentage
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.seasonal_campaign.discount_percentage}
                    onChange={(e) => updateCampaign('discount_percentage', parseInt(e.target.value))}
                    className="bg-black/20 border-white/10 text-white h-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                    Banner Text
                  </Label>
                  <Textarea
                    value={settings.seasonal_campaign.banner_text}
                    onChange={(e) => updateCampaign('banner_text', e.target.value)}
                    className="bg-black/20 border-white/10 text-white min-h-20"
                    placeholder="e.g., 🎉 MEGA SALE - 30% OFF!"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                      Start Date
                    </Label>
                    <Input
                      type="date"
                      value={settings.seasonal_campaign.start_date}
                      onChange={(e) => updateCampaign('start_date', e.target.value)}
                      className="bg-black/20 border-white/10 text-white h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                      End Date
                    </Label>
                    <Input
                      type="date"
                      value={settings.seasonal_campaign.end_date}
                      onChange={(e) => updateCampaign('end_date', e.target.value)}
                      className="bg-black/20 border-white/10 text-white h-10"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            {settings.seasonal_campaign.active && settings.seasonal_campaign.banner_text && (
              <div className="mt-6 p-4 bg-gradient-to-r from-[#003366] to-[#0066cc] rounded-lg text-center">
                <p className="text-white font-bold">{settings.seasonal_campaign.banner_text}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
