import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Disc3 } from 'lucide-react';

export default function Login() {
  const { login, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      login(response.data.user, response.data.token);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Disc3 className="w-8 h-8 text-[#d946ef]" />
            <span className="text-2xl font-bold text-white">SONIC RECORDS</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-[#a1a1aa]">Sign in to your account</p>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div>
              <Label htmlFor="email" className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 focus:ring-1 focus:ring-[#d946ef]/50 rounded-lg h-12 text-white"
                placeholder="john@example.com"
                data-testid="login-email-input"
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
                className="bg-black/20 border-white/10 focus:border-[#d946ef]/50 focus:ring-1 focus:ring-[#d946ef]/50 rounded-lg h-12 text-white"
                placeholder="••••••••"
                data-testid="login-password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-full h-12 glow-primary"
              data-testid="login-submit-btn"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#a1a1aa] text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#d946ef] hover:underline" data-testid="login-register-link">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}