import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Disc3 } from 'lucide-react';

export default function Register() {
  const { login, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    company_name: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      login(response.data.user, response.data.token);
      toast.success('Registration successful!');
      navigate('/contract');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-white">BjBrands Studios</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-[#a1a1aa]">Start your journey with us</p>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="register-form">
            <div>
              <Label htmlFor="name" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Full Name</Label>
              <Input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 focus:ring-1 focus:ring-[#003366]/50 rounded-lg h-12 text-white"
                placeholder="John Doe"
                data-testid="register-name-input"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 focus:ring-1 focus:ring-[#003366]/50 rounded-lg h-12 text-white"
                placeholder="john@example.com"
                data-testid="register-email-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 focus:ring-1 focus:ring-[#003366]/50 rounded-lg h-12 text-white"
                placeholder="••••••••"
                data-testid="register-password-input"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Phone (Optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 focus:ring-1 focus:ring-[#003366]/50 rounded-lg h-12 text-white"
                placeholder="+1234567890"
                data-testid="register-phone-input"
              />
            </div>

            <div>
              <Label htmlFor="company" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Company/Band Name (Optional)</Label>
              <Input
                id="company"
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({...formData, company_name: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#003366]/50 focus:ring-1 focus:ring-[#003366]/50 rounded-lg h-12 text-white"
                placeholder="My Band"
                data-testid="register-company-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-full h-12 glow-primary"
              data-testid="register-submit-btn"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a1a1aa] text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-[#d946ef] hover:underline" data-testid="register-login-link">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}