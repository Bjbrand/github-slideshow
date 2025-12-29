import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, Disc3, Music } from 'lucide-react';

export default function BookingPage() {
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service_type: '',
    date: '',
    time: '',
    duration: 2,
    project_duration_days: 7,
    payment_percentage: 100,
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const servicePricing = {
    "Recording": { price: 50000, discount: true },
    "Mixing": { price: 70000, discount: false },
    "Mastering": { price: 30000, discount: false },
    "A Cappella": { price: 40000, discount: false },
    "Video Recording": { price: 150000, discount: true },
    "Video Editing": { price: 100000, discount: true }
  };

  const getServicePrice = () => {
    const service = servicePricing[formData.service_type];
    if (!service) return 0;
    return service.price;
  };

  const getAmountDue = () => {
    const basePrice = getServicePrice();
    return Math.round((basePrice * formData.payment_percentage) / 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/bookings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Booking created! Downloading invoice...');
      
      // Download invoice
      const invoiceResponse = await axios.get(
        `${API}/bookings/${response.data.id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([invoiceResponse.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${response.data.invoice_id.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold text-white">BjBrands Studios</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="text-white/70 hover:text-white"
              data-testid="booking-dashboard-btn"
            >
              Dashboard
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-white/70 hover:text-white"
              data-testid="booking-logout-btn"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-[#003366]/10 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Book a Session</h1>
              <p className="text-[#a1a1aa]">Select your service and preferred time</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6" data-testid="booking-form">
            <div>
              <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Service Type</Label>
              <Select
                value={formData.service_type}
                onValueChange={(value) => setFormData({...formData, service_type: value})}
                required
              >
                <SelectTrigger className="bg-black/20 border-white/10 h-12 text-white" data-testid="booking-service-select">
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="Recording" data-testid="service-recording">Recording</SelectItem>
                  <SelectItem value="Mixing" data-testid="service-mixing">Mixing</SelectItem>
                  <SelectItem value="Mastering" data-testid="service-mastering">Mastering</SelectItem>
                  <SelectItem value="A Cappella" data-testid="service-acappella">A Cappella</SelectItem>
                  <SelectItem value="Video Recording" data-testid="service-video-recording">Video Recording</SelectItem>
                  <SelectItem value="Video Editing" data-testid="service-video-editing">Video Editing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="date" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="bg-black/20 border-white/10 focus:border-[#003366]/50 h-12 text-white"
                  data-testid="booking-date-input"
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time
                </Label>
                <Input
                  id="time"
                  type="time"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="bg-black/20 border-white/10 focus:border-[#003366]/50 h-12 text-white"
                  data-testid="booking-time-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Session Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value)})}
                className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 h-12 text-white"
                data-testid="booking-duration-input"
              />
              <p className="text-xs text-[#52525b] mt-1">Minimum 2 hours - $100/hour</p>
            </div>

            <div>
              <Label htmlFor="project_duration" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Project Completion Duration (days)</Label>
              <Input
                id="project_duration"
                type="number"
                min="1"
                max="60"
                required
                value={formData.project_duration_days}
                onChange={(e) => setFormData({...formData, project_duration_days: parseInt(e.target.value)})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 h-12 text-white"
                data-testid="booking-project-duration-input"
              />
              <p className="text-xs text-[#52525b] mt-1">Expected days for project completion</p>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Payment Percentage</Label>
              <Select
                value={formData.payment_percentage.toString()}
                onValueChange={(value) => setFormData({...formData, payment_percentage: parseInt(value)})}
                required
              >
                <SelectTrigger className="bg-black/20 border-white/10 h-12 text-white" data-testid="booking-payment-percentage-select">
                  <SelectValue placeholder="Select payment percentage" />
                </SelectTrigger>
                <SelectContent className="bg-[#121212] border-white/10">
                  <SelectItem value="70">70% - TZS {formData.service_type && Math.round(getServicePrice() * 0.7).toLocaleString()}</SelectItem>
                  <SelectItem value="80">80% - TZS {formData.service_type && Math.round(getServicePrice() * 0.8).toLocaleString()}</SelectItem>
                  <SelectItem value="90">90% - TZS {formData.service_type && Math.round(getServicePrice() * 0.9).toLocaleString()}</SelectItem>
                  <SelectItem value="100">100% - TZS {formData.service_type && getServicePrice().toLocaleString()}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-[#52525b] mt-1">Choose payment percentage (minimum 70%)</p>
            </div>

            <div>
              <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 text-white min-h-24"
                placeholder="Any special requirements or notes..."
                data-testid="booking-notes-input"
              />
            </div>

            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-[#a1a1aa]">Estimated Total:</span>
                <span className="text-2xl font-bold text-white">${formData.duration * 100}</span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.service_type}
              className="w-full bg-[#003366] hover:bg-[#004080] text-white rounded-full h-12 text-lg glow-primary"
              data-testid="booking-submit-btn"
            >
              {loading ? 'Creating Booking...' : 'Generate Invoice & Book'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}