import { Link } from 'react-router-dom';
import { Music, Mic, Headphones, Disc3 } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-white.png" alt="BjBrands Studios Logo" className="h-10 w-10 object-contain" />
            <span className="text-2xl font-bold tracking-tight">BjBrands Studios</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white" data-testid="nav-login-btn">
                Login
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-6 glow-primary" data-testid="nav-register-btn">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-radial from-[#d946ef]/15 via-transparent to-transparent"></div>
          <img 
            src="https://images.unsplash.com/photo-1763771757355-d2a395b5f8ea?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHxyZWNvcmRpbmclMjBzdHVkaW8lMjBpbnRlcmlvciUyMG5lb24lMjBsaWdodGluZ3xlbnwwfHx8fDE3NjY4OTYyNTh8MA&ixlib=rb-4.1.0&q=85"
            alt="Recording studio interior"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-8 space-y-6">
            <div className="inline-block">
              <span className="text-xs uppercase tracking-widest text-[#a1a1aa] bg-white/5 px-4 py-2 rounded-full border border-white/10">
                Professional Recording Studio
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-none">
              Create Your
              <span className="block text-[#003366] mt-2">Sonic Masterpiece</span>
            </h1>
            <p className="text-lg text-[#a1a1aa] max-w-2xl">
              Book studio sessions, manage projects, and collaborate with our engineers—all in one seamless platform.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <Link to="/register">
                <Button className="bg-[#003366] hover:bg-[#004080] text-white rounded-full px-8 h-12 text-base glow-primary" data-testid="hero-get-started-btn">
                  Book Your Session
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white rounded-full px-8 h-12" data-testid="hero-login-btn">
                  Client Portal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase tracking-widest text-[#a1a1aa]">Our Services</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Studio Services</h2>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-[#121212] border border-white/5 hover:border-[#d946ef]/50 p-8 rounded-xl transition-all duration-300 group" data-testid="service-recording">
              <div className="w-12 h-12 bg-[#d946ef]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#d946ef]/20 transition-colors">
                <Mic className="w-6 h-6 text-[#d946ef]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Recording</h3>
              <p className="text-[#a1a1aa] text-sm">Professional multi-track recording with state-of-the-art equipment.</p>
            </div>

            <div className="bg-[#121212] border border-white/5 hover:border-[#d946ef]/50 p-8 rounded-xl transition-all duration-300 group" data-testid="service-mixing">
              <div className="w-12 h-12 bg-[#3b82f6]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3b82f6]/20 transition-colors">
                <Music className="w-6 h-6 text-[#3b82f6]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mixing</h3>
              <p className="text-[#a1a1aa] text-sm">Expert mixing to bring balance and clarity to your tracks.</p>
            </div>

            <div className="bg-[#121212] border border-white/5 hover:border-[#d946ef]/50 p-8 rounded-xl transition-all duration-300 group" data-testid="service-mastering">
              <div className="w-12 h-12 bg-[#00ff94]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#00ff94]/20 transition-colors">
                <Headphones className="w-6 h-6 text-[#00ff94]" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mastering</h3>
              <p className="text-[#a1a1aa] text-sm">Final polish to make your music ready for distribution.</p>
            </div>

            <div className="bg-[#121212] border border-white/5 hover:border-[#d946ef]/50 p-8 rounded-xl transition-all duration-300 group" data-testid="service-acappella">
              <div className="w-12 h-12 bg-[#ef4444]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#ef4444]/20 transition-colors">
                <Disc3 className="w-6 h-6 text-[#ef4444]" />
              </div>
              <h3 className="text-xl font-bold mb-2">A Cappella</h3>
              <p className="text-[#a1a1aa] text-sm">Vocal isolation and enhancement for pristine a cappella tracks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#121212] border border-white/5 rounded-2xl p-12 text-center glass-card">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Record?</h2>
            <p className="text-lg text-[#a1a1aa] mb-8 max-w-2xl mx-auto">
              Join hundreds of artists who trust us with their sound. Book your first session today.
            </p>
            <Link to="/register">
              <Button className="bg-[#d946ef] hover:bg-[#c026d3] text-white rounded-full px-10 h-14 text-lg glow-primary" data-testid="cta-book-now-btn">
                Book Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto text-center text-[#a1a1aa] text-sm">
          <p>© 2025 BjBrands Studios. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}