import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { Disc3, Calendar, FileText, Upload, Music, ChevronRight } from 'lucide-react';
import { Input } from '../components/ui/input';

export default function ClientDashboard() {
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingPayment, setUploadingPayment] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setProjects(projectsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async (bookingId, file) => {
    setUploadingPayment(bookingId);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${API}/bookings/${bookingId}/payment-proof`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Payment proof uploaded successfully!');
      fetchData();
    } catch (error) {
      toast.error('Failed to upload payment proof');
    } finally {
      setUploadingPayment(null);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-[#a1a1aa] bg-white/5',
      in_progress: 'text-[#3b82f6] bg-[#3b82f6]/10',
      revision_requested: 'text-[#d946ef] bg-[#d946ef]/10',
      completed: 'text-[#00ff94] bg-[#00ff94]/10'
    };
    return colors[status] || colors.pending;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: 'text-[#ef4444] bg-[#ef4444]/10',
      verification_pending: 'text-[#d946ef] bg-[#d946ef]/10',
      confirmed: 'text-[#00ff94] bg-[#00ff94]/10'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold text-white">BjBrands Studios</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#a1a1aa]">Welcome, {user?.name}</span>
            <Button
              onClick={() => navigate('/book')}
              className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-6"
              data-testid="dashboard-book-session-btn"
            >
              Book Session
            </Button>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-white/70 hover:text-white"
              data-testid="dashboard-logout-btn"
            >
              Logout
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="stat-total-projects">
            <div className="text-[#a1a1aa] text-sm mb-1">Total Projects</div>
            <div className="text-3xl font-bold text-white">{projects.length}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="stat-total-bookings">
            <div className="text-[#a1a1aa] text-sm mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-white">{bookings.length}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="stat-in-progress">
            <div className="text-[#a1a1aa] text-sm mb-1">In Progress</div>
            <div className="text-3xl font-bold text-[#3b82f6]">{projects.filter(p => p.status === 'in_progress').length}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="stat-completed">
            <div className="text-[#a1a1aa] text-sm mb-1">Completed</div>
            <div className="text-3xl font-bold text-[#00ff94]">{projects.filter(p => p.status === 'completed').length}</div>
          </div>
        </div>

        {/* Pending Payment Bookings */}
        {bookings.filter(b => b.payment_status !== 'confirmed').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Payments</h2>
            <div className="space-y-4">
              {bookings.filter(b => b.payment_status !== 'confirmed').map(booking => (
                <div key={booking.id} className="bg-[#121212] border border-white/5 rounded-xl p-6" data-testid={`booking-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Music className="w-5 h-5 text-[#d946ef]" />
                        <h3 className="text-lg font-bold text-white">{booking.service_type}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${getPaymentStatusColor(booking.payment_status)}`}>
                          {booking.payment_status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-[#a1a1aa]">
                        <span><Calendar className="w-4 h-4 inline mr-1" />{booking.date} at {booking.time}</span>
                        <span>{booking.duration} hours - ${booking.duration * 100}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => window.open(`${API}/bookings/${booking.id}/invoice`, '_blank')}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        data-testid={`download-invoice-${booking.id}`}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Invoice
                      </Button>
                      {booking.payment_status === 'pending' && (
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*,.pdf"
                            onChange={(e) => e.target.files[0] && handlePaymentUpload(booking.id, e.target.files[0])}
                            disabled={uploadingPayment === booking.id}
                            data-testid={`upload-payment-${booking.id}`}
                          />
                          <Button
                            type="button"
                            className="bg-[#d946ef] hover:bg-[#c026d3] text-white pointer-events-none"
                            disabled={uploadingPayment === booking.id}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            {uploadingPayment === booking.id ? 'Uploading...' : 'Upload Payment'}
                          </Button>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">My Projects</h2>
          {projects.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-[#a1a1aa] mx-auto mb-4" />
              <p className="text-[#a1a1aa] mb-4">No projects yet. Book your first session to get started!</p>
              <Button
                onClick={() => navigate('/book')}
                className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-6"
              >
                Book Now
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map(project => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="bg-[#121212] border border-white/5 hover:border-white/10 rounded-xl p-6 cursor-pointer transition-all"
                  data-testid={`project-${project.id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{project.service_type}</h3>
                      <p className="text-sm text-[#a1a1aa]">Deadline: {project.deadline}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#a1a1aa]" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}