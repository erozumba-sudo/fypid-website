import { useState, useEffect } from 'react';
import { Sparkles, Users, Zap } from 'lucide-react';
import Landing from './pages/Landing';
import Checkout from './pages/Checkout';
import AffiliatePage from './pages/AffiliatePage';
import WebhookLogs from './pages/WebhookLogs';
import { Registration } from './lib/supabase';

type Page = 'landing' | 'checkout' | 'affiliate' | 'webhook';

export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const [pendingReg, setPendingReg] = useState<(Registration & { id: string }) | null>(null);
  const [initialRef, setInitialRef] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setInitialRef(ref.toUpperCase());
  }, []);

  function handleGoToCheckout(reg: Registration & { id: string }) {
    setPendingReg(reg);
    setPage('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCheckoutSuccess() {
    setPendingReg(null);
    setPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBack() {
    setPage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0C10]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => setPage('landing')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#b8920e] flex items-center justify-center shadow-lg shadow-[#D4AF37]/25">
              <Sparkles className="w-5 h-5 text-[#0B0C10]" />
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-serif font-bold text-[#D4AF37] text-base tracking-wide">
                Nama Hoki &amp; Garis Hoki
              </span>
              <span className="text-[10px] text-[#D4AF37]/50 font-medium uppercase tracking-widest">
                Numerologi &amp; Weton
              </span>
            </div>
          </button>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage('affiliate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all duration-200 ${
                page === 'affiliate'
                  ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 shadow shadow-[#D4AF37]/15'
                  : 'text-[#D4AF37] hover:bg-[#D4AF37]/10 border border-[#D4AF37]/20 hover:border-[#D4AF37]/40'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Afiliasi</span>
            </button>
            <button
              onClick={() => setPage('webhook')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                page === 'webhook'
                  ? 'bg-orange-400/15 text-orange-400 border border-orange-400/30'
                  : 'text-white/40 hover:text-white/70 border border-white/10 hover:border-white/20'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:block">Dev Logs</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Page content — offset by nav height */}
      <div className="pt-16">
        {page === 'landing' && (
          <Landing
            onGoToCheckout={handleGoToCheckout}
            onGoToAffiliate={() => { setPage('affiliate'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            initialRef={initialRef}
          />
        )}
        {page === 'checkout' && pendingReg && (
          <Checkout
            registration={pendingReg}
            onSuccess={handleCheckoutSuccess}
            onBack={() => setPage('landing')}
          />
        )}
        {page === 'affiliate' && (
          <AffiliatePage onBack={handleBack} />
        )}
        {page === 'webhook' && (
          <WebhookLogs onBack={handleBack} />
        )}
      </div>
    </div>
  );
}
