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
    notes: ''
  });
  const [loading, setLoading] = useState(false);

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
          <div className="flex items-center gap-2">
            <Disc3 className="w-8 h-8 text-[#d946ef]" />
            <span className="text-2xl font-bold text-white">SONIC RECORDS</span>
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
            <div className="w-12 h-12 bg-[#d946ef]/10 rounded-lg flex items-center justify-center">
              <Music className="w-6 h-6 text-[#d946ef]" />
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
                  className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 h-12 text-white"
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
                  className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 h-12 text-white"
                  data-testid="booking-time-input"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="duration" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Duration (hours)</Label>
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
              className="w-full bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-full h-12 text-lg glow-primary"
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