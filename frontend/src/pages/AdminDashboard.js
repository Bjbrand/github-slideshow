import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { Disc3, Users, Music, DollarSign, Calendar, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, API, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashRes, clientsRes, projectsRes, bookingsRes] = await Promise.all([
        axios.get(`${API}/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/clients`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/projects`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setDashboardData(dashRes.data);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const approvePayment = async (bookingId) => {
    try {
      await axios.post(`${API}/bookings/${bookingId}/approve-payment`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payment approved and project created!');
      fetchData();
    } catch (error) {
      toast.error('Failed to approve payment');
    }
  };

  const updateProjectStatus = async (projectId, status) => {
    try {
      await axios.patch(`${API}/projects/${projectId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Project status updated!');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
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
          <div className="flex items-center gap-2">
            <Disc3 className="w-8 h-8 text-[#d946ef]" />
            <span className="text-2xl font-bold text-white">SONIC RECORDS</span>
            <span className="text-sm text-[#a1a1aa] ml-4">Admin Dashboard</span>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-white/70 hover:text-white"
            data-testid="admin-logout-btn"
          >
            Logout
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="admin-stat-clients">
            <Users className="w-8 h-8 text-[#d946ef] mb-2" />
            <div className="text-[#a1a1aa] text-sm mb-1">Total Clients</div>
            <div className="text-3xl font-bold text-white">{dashboardData?.total_clients || 0}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="admin-stat-projects">
            <Music className="w-8 h-8 text-[#3b82f6] mb-2" />
            <div className="text-[#a1a1aa] text-sm mb-1">Total Projects</div>
            <div className="text-3xl font-bold text-white">{dashboardData?.total_projects || 0}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="admin-stat-bookings">
            <Calendar className="w-8 h-8 text-[#00ff94] mb-2" />
            <div className="text-[#a1a1aa] text-sm mb-1">Total Bookings</div>
            <div className="text-3xl font-bold text-white">{dashboardData?.total_bookings || 0}</div>
          </div>
          <div className="bg-[#121212] border border-white/5 p-6 rounded-xl" data-testid="admin-stat-pending-payments">
            <DollarSign className="w-8 h-8 text-[#ef4444] mb-2" />
            <div className="text-[#a1a1aa] text-sm mb-1">Pending Payments</div>
            <div className="text-3xl font-bold text-white">{dashboardData?.pending_payments || 0}</div>
          </div>
        </div>

        {/* Pending Payment Approvals */}
        {bookings.filter(b => b.payment_status === 'verification_pending').length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pending Payment Approvals</h2>
            <div className="space-y-4">
              {bookings.filter(b => b.payment_status === 'verification_pending').map(booking => (
                <div key={booking.id} className="bg-[#121212] border border-white/5 rounded-xl p-6" data-testid={`pending-booking-${booking.id}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-1">{booking.client_name}</h3>
                      <p className="text-[#a1a1aa] text-sm">
                        {booking.service_type} - {booking.date} at {booking.time} ({booking.duration}h - ${booking.duration * 100})
                      </p>
                    </div>
                    <Button
                      onClick={() => approvePayment(booking.id)}
                      className="bg-[#00ff94] hover:bg-[#00ff94]/90 text-black"
                      data-testid={`approve-payment-${booking.id}`}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve Payment
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Management */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Projects</h2>
          {projects.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 rounded-xl p-12 text-center">
              <Music className="w-12 h-12 text-[#a1a1aa] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">No projects yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map(project => (
                <div key={project.id} className="bg-[#121212] border border-white/5 rounded-xl p-6" data-testid={`admin-project-${project.id}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-white">{project.service_type}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#a1a1aa] text-sm">
                        Client: {project.client_name} | Deadline: {project.deadline}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select
                        value={project.status}
                        onValueChange={(value) => updateProjectStatus(project.id, value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white w-48" data-testid={`status-select-${project.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#121212] border-white/10">
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="revision_requested">Revision Requested</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => navigate(`/projects/${project.id}`)}
                        variant="outline"
                        className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        data-testid={`view-project-${project.id}`}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clients List */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Clients</h2>
          {clients.length === 0 ? (
            <div className="bg-[#121212] border border-white/5 rounded-xl p-12 text-center">
              <Users className="w-12 h-12 text-[#a1a1aa] mx-auto mb-4" />
              <p className="text-[#a1a1aa]">No clients yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {clients.map(client => (
                <div key={client.id} className="bg-[#121212] border border-white/5 rounded-xl p-6" data-testid={`client-${client.id}`}>
                  <h3 className="text-lg font-bold text-white mb-1">{client.name}</h3>
                  <p className="text-[#a1a1aa] text-sm mb-2">{client.email}</p>
                  {client.phone && <p className="text-[#52525b] text-xs">{client.phone}</p>}
                  {client.company_name && <p className="text-[#52525b] text-xs">{client.company_name}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}