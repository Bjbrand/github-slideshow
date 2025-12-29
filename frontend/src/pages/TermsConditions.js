import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function TermsConditions() {
  const [terms, setTerms] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
  }, []);

  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${API}/settings/terms`);
      setTerms(response.data.terms);
    } catch (error) {
      console.error('Failed to load terms');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white/70 hover:text-white mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold text-white">BjBrands Studios</span>
          </div>
        </div>

        <div className="bg-[#121212] border border-white/5 rounded-xl p-8">
          <h1 className="text-3xl font-bold text-white mb-6">Terms and Conditions</h1>
          <div className="prose prose-invert max-w-none">
            <div className="text-[#a1a1aa] whitespace-pre-wrap leading-relaxed">
              {terms}
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-[#52525b] text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}