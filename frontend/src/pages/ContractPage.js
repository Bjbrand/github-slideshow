import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../App';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { FileText, CheckCircle2, Disc3 } from 'lucide-react';

export default function ContractPage() {
  const { user, token, API } = useContext(AuthContext);
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    checkContractStatus();
  }, []);

  const checkContractStatus = async () => {
    try {
      const response = await axios.get(`${API}/contract/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.accepted) {
        setAccepted(true);
      }
    } catch (error) {
      console.error('Error checking contract status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await axios.post(`${API}/contract/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Contract accepted successfully!');
      setAccepted(true);
      setTimeout(() => navigate('/book'), 1500);
    } catch (error) {
      toast.error('Failed to accept contract');
    } finally {
      setAccepting(false);
    }
  };

  const viewPDF = () => {
    window.open(`${API}/contract/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-[#121212] border border-white/5 rounded-xl p-12">
            <CheckCircle2 className="w-16 h-16 text-[#00ff94] mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-white mb-4">Contract Accepted</h1>
            <p className="text-[#a1a1aa] mb-8">
              You've already accepted the recording services agreement. You can now proceed to book sessions.
            </p>
            <Button
              onClick={() => navigate('/book')}
              className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-8 h-12 glow-primary"
              data-testid="contract-proceed-btn"
            >
              Book a Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold text-white">BjBrands Studios</span>
          </div>
          <span className="text-[#a1a1aa]">Welcome, {user?.name}</span>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-[#003366]/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-[#003366]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Recording Services Agreement</h1>
              <p className="text-[#a1a1aa] text-sm">Please review and accept the terms</p>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto" data-testid="contract-content">
            <h2 className="text-lg font-bold text-white mb-4">Terms and Conditions</h2>
            <div className="space-y-3 text-[#a1a1aa] text-sm">
              <p><strong>1. Payment Terms:</strong> The Client agrees to pay the full session fee before recording begins.</p>
              <p><strong>2. Session Rates:</strong> Studio time is charged per hour with a minimum 2-hour booking.</p>
              <p><strong>3. Cancellation Policy:</strong> Cancellations require 48 hours notice for a full refund.</p>
              <p><strong>4. Intellectual Property:</strong> The Client retains all rights to their recordings.</p>
              <p><strong>5. Portfolio Use:</strong> The Studio may use recordings for portfolio purposes with permission.</p>
              <p><strong>6. Revisions:</strong> Two rounds of revisions are included in mixing/mastering services.</p>
              <p><strong>7. Additional Revisions:</strong> Additional revisions are charged at $50 per revision.</p>
              <p><strong>8. Delivery Timeline:</strong> Files will be delivered within 7 business days of session completion.</p>
              <p><strong>9. Liability:</strong> The Studio is not liable for equipment failure or data loss.</p>
              <p><strong>10. Agreement:</strong> By booking, the Client agrees to these terms and conditions.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              onClick={viewPDF}
              variant="outline"
              className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full px-6"
              data-testid="contract-view-pdf-btn"
            >
              View Full PDF
            </Button>
            <Button
              onClick={handleAccept}
              disabled={accepting}
              className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-8 h-12 glow-primary"
              data-testid="contract-accept-btn"
            >
              {accepting ? 'Accepting...' : 'I Agree - Accept Contract'}
            </Button>
          </div>

          <p className="text-xs text-[#52525b] mt-4">
            By clicking "I Agree", you electronically sign this agreement. Your IP address and timestamp will be recorded.
          </p>
        </div>
      </div>
    </div>
  );
}