import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error('Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/verify-otp`, { email, otp });
      toast.success('OTP verified!');
      setStep(3);
    } catch (error) {
      toast.error('Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, { email, otp, new_password: newPassword });
      toast.success('Password reset successfully!');
      setTimeout(() => window.location.href = '/login', 2000);
    } catch (error) {
      toast.error('Failed to reset password');
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
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-[#a1a1aa]">Step {step} of 3</p>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Email Address</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-[#003366]/50 rounded-lg h-12 text-white"
                  placeholder="your@email.com"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#003366] hover:bg-[#004080] text-white rounded-full h-12">
                {loading ? 'Sending...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">Enter OTP</Label>
                <Input
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-[#003366]/50 rounded-lg h-12 text-white text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <p className="text-xs text-[#52525b] mt-2">Check your email for the 6-digit code</p>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#003366] hover:bg-[#004080] text-white rounded-full h-12">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <Label className="text-xs uppercase tracking-wider text-[#a1a1aa] mb-2 block">New Password</Label>
                <Input
                  type="password"
                  required
                  minLength="6"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-black/20 border-white/10 focus:border-[#003366]/50 rounded-lg h-12 text-white"
                  placeholder="••••••••"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-[#003366] hover:bg-[#004080] text-white rounded-full h-12">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-[#003366] hover:underline text-sm">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}