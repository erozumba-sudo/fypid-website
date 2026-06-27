import { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Star, ChevronDown, Mail, Calendar, User, ArrowRight, CheckCircle, TrendingUp, Zap, Shield } from 'lucide-react';
import { supabase, Registration } from '../lib/supabase';
import { analyzeNumerology } from '../lib/numerology';
import SpaceBackground, { Moon, PlanetWithRings, Constellation } from '../components/SpaceBackground';

interface LandingProps {
  onGoToCheckout: (reg: Registration & { id: string }) => void;
  onGoToAffiliate?: () => void;
  initialRef?: string;
}

const EXAMPLE_CARDS = [
  {
    namaAsli: 'Bambang Supriyadi',
    namaPanggilan: 'Bimo',
    angka: 6,
    label: 'Bisnis & Keberuntungan',
    desc: 'Vibrasi angka 6 membawa harmoni, kepercayaan klien, dan magnet rezeki dalam setiap transaksi bisnis.',
  },
  {
    namaAsli: 'Sri Wahyuni',
    namaPanggilan: 'Yuni',
    angka: 8,
    label: 'Kekayaan & Kelimpahan',
    desc: 'Vibrasi angka 8 melambangkan kemakmuran tak terbatas, kekuatan finansial, dan pencapaian yang luar biasa.',
  },
];

const HOOK_PHRASES = [
  '🔥 Nama Salah = Rezeki Terblokir — Cek Sekarang Sebelum Terlambat!',
  '💰 Ratusan Orang Sudah Ganti Nama Hoki & Langsung Naik Omzet!',
  '⚡ Viral! Satu Perubahan Nama Panggilan Bisa Ubah Nasibmu 180°',
  '🌟 Affiliator Terbaik: Share Link-mu & Hasilkan Passive Income Setiap Hari!',
  '🚀 Namamu Adalah Mantra — Salah Vibrasi, Rezekimu Ikut Tersesat',
  '💎 Bergabung Sekarang: Komisi Affiliasi Tertinggi di Niche Spiritual!',
  '✨ Tanda Tangan Hoki-mu Menentukan Nasib — Sudah Selaras Belum?',
  '🎯 Ribuan Orang Sudah Buktikan: Nama Hoki = Magnet Uang & Peluang',
  '🤑 Jadilah Affiliator Kami — Cukup Share, Komisi Langsung Masuk!',
  '🌙 Weton + Numerologi = Formula Rahasia Orang Sukses di Indonesia',
];

function HookTicker() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  const next = useCallback(() => {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + 1) % HOOK_PHRASES.length);
      setVisible(true);
    }, 400);
  }, []);

  useEffect(() => {
    const id = setInterval(next, 3200);
    return () => clearInterval(id);
  }, [next]);

  return (
    <div className="relative overflow-hidden h-10 flex items-center justify-center mb-6">
      <div
        className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-400"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.35s ease, transform 0.35s ease',
          background: 'linear-gradient(90deg, rgba(212,175,55,0.12) 0%, rgba(75,0,130,0.12) 100%)',
          border: '1px solid rgba(212,175,55,0.25)',
          color: '#F3E5AB',
          whiteSpace: 'nowrap',
        }}
      >
        {HOOK_PHRASES[index]}
      </div>
    </div>
  );
}

export default function Landing({ onGoToCheckout, onGoToAffiliate, initialRef }: LandingProps) {
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    nama_lengkap: '',
    tanggal_lahir: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // initialRef is passed down so Checkout can credit the correct affiliator
    void initialRef;
  }, [initialRef]);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.nama_lengkap || !form.tanggal_lahir || !form.email) {
      setError('Harap lengkapi semua field yang wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const result = analyzeNumerology(form.nama_lengkap, form.tanggal_lahir);

      // Credit affiliator via URL ?ref= param if present
      let affiliatorId: string | null = null;
      if (initialRef) {
        const { data: aff } = await supabase
          .from('affiliators')
          .select('id, total_klik')
          .eq('kode_referral', initialRef.toUpperCase())
          .maybeSingle();
        if (aff) {
          affiliatorId = aff.id;
          await supabase
            .from('affiliators')
            .update({ total_klik: ((aff.total_klik as number) ?? 0) + 1 })
            .eq('id', aff.id);
        }
      }

      const payload: Registration = {
        nama_lengkap: form.nama_lengkap,
        tanggal_lahir: form.tanggal_lahir,
        email: form.email,
        nomer_hp: '',
        weton: result.weton,
        angka_hoki: result.lifePath,
        nama_hoki: result.luckyName,
        status_pembayaran: 'pending',
        affiliator_id: affiliatorId,
      };

      const { data, error: dbError } = await supabase
        .from('registrations')
        .insert(payload)
        .select()
        .single();

      if (dbError) throw dbError;
      if (!data) throw new Error('Gagal menyimpan data.');

      onGoToCheckout(data as Registration & { id: string });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white">
      {/* ── HERO ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060710] via-[#0b0c18] to-[#0B0C10]" />

        {/* Nebula blobs */}
        <div className="nebula-float absolute top-[-10%] left-[-5%] w-[600px] h-[500px] rounded-full bg-[#4B0082]/12 blur-[110px]" />
        <div className="nebula-float-delay absolute bottom-[-5%] right-[-8%] w-[500px] h-[400px] rounded-full bg-[#D4AF37]/7 blur-[100px]" />
        <div className="nebula-float absolute top-[40%] right-[10%] w-[300px] h-[300px] rounded-full bg-[#1a006e]/15 blur-[80px]" />
        <div className="nebula-float-delay absolute bottom-[20%] left-[5%] w-[250px] h-[250px] rounded-full bg-[#D4AF37]/5 blur-[70px]" />

        {/* Animated star field */}
        <SpaceBackground count={110} showShooters />

        {/* Moon — top-right, partially cropped */}
        <div className="absolute -top-8 -right-8 md:right-8 lg:right-16 xl:right-24 opacity-80 md:opacity-90 hidden sm:block">
          <Moon className="w-40 h-40 md:w-52 md:h-52 lg:w-64 lg:h-64" />
        </div>

        {/* Saturn-ring planet — bottom-left, half hidden */}
        <div className="absolute -bottom-10 -left-16 opacity-40 hidden md:block">
          <PlanetWithRings className="w-52 h-40" />
        </div>

        {/* Constellation top-left */}
        <div className="absolute top-16 left-4 md:left-12 opacity-60 hidden lg:block">
          <Constellation className="w-36 h-28" />
        </div>

        {/* Subtle horizon glow */}
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#D4AF37]/5 to-transparent" />

        {/* Hero content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/12 text-[#F3E5AB] text-sm md:text-base font-black uppercase tracking-widest mb-8 shadow-lg shadow-[#D4AF37]/10">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            <span>
              <span className="text-[#D4AF37]">VIRAL</span>{' '}
              di TikTok &amp; Instagram
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            <span className="text-white">Bongkar Rahasia</span>
            <br />
            <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">
              Garis Takdirmu!
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-4">
            Apakah <strong className="text-[#F3E5AB]">Nama Panggilan</strong> &amp;{' '}
            <strong className="text-[#F3E5AB]">Tanda Tanganmu</strong> sudah menarik rezeki, atau
            justru <span className="text-red-400">menghambat suksesmu?</span>
          </p>
          <p className="text-base text-white/70 mb-10">
            Cek Angka Keberuntunganmu yang Sedang{' '}
            <strong className="text-[#D4AF37] text-xl font-black tracking-wide">VIRAL</strong>{' '}
            sekarang!
          </p>

          <button
            onClick={scrollToForm}
            className="btn-hoki-pulse group relative inline-flex items-center gap-3 px-9 py-4 rounded-full text-[#0B0C10] font-black text-base overflow-hidden hover:scale-105 transition-transform duration-300"
            style={{
              background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
              backgroundSize: '200% auto',
              animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
            }}
          >
            <Sparkles className="w-5 h-5 relative z-10 shrink-0" />
            <span className="relative z-10 tracking-wide">Cek Angka Hoki Saya</span>
            <ChevronDown className="w-5 h-5 relative z-10 group-hover:translate-y-1 transition-transform shrink-0" />
          </button>

          <div className="flex flex-wrap justify-center gap-6 mt-12 text-white/40 text-sm">
            {['10.000+ Pengguna Puas', 'Akurasi Numerologi Tinggi', 'Rahasia & Aman', 'Pakar Weton Jawa'].map(b => (
              <span key={b} className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                {b}
              </span>
            ))}
          </div>

          {/* ── AFFILIATOR PROMO BANNER ── */}
          <button
            onClick={onGoToAffiliate}
            className="mt-10 w-full max-w-xl mx-auto flex items-center gap-4 px-6 py-4 rounded-2xl border border-[#D4AF37]/40 text-left group overflow-hidden relative"
            style={{
              background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 50%, #1a1507 100%)',
              animation: 'aff-border-pulse 2.5s ease-in-out infinite',
            }}
          >
            <style>{`
              @keyframes aff-border-pulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0), 0 0 18px 2px rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.35); }
                50% { box-shadow: 0 0 0 6px rgba(212,175,55,0.12), 0 0 32px 6px rgba(212,175,55,0.22); border-color: rgba(212,175,55,0.8); }
              }
            `}</style>
            <div
              className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
                backgroundSize: '200% auto',
                animation: 'btn-shimmer 3s linear infinite',
              }}
            >
              <Star className="w-6 h-6 text-[#0B0C10]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#D4AF37] font-black text-sm tracking-wide">Daftar Affiliator — Komisi 30%</div>
              <div className="text-white/50 text-xs mt-0.5 truncate">Cukup Rp 50.000 sekali — sebar link, cuan terus!</div>
            </div>
            <ArrowRight className="w-5 h-5 text-[#D4AF37]/60 shrink-0 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-[#D4AF37]/50" />
        </div>
      </section>

      {/* ── EDUCATION ── */}
      <section className="relative py-20 px-4 bg-[#0d0e18] overflow-hidden">
        {/* Space accents */}
        <SpaceBackground count={45} showShooters={false} />
        <div className="absolute top-8 right-4 lg:right-16 opacity-30 pointer-events-none hidden md:block">
          <PlanetWithRings className="w-32 h-24" color="#1a3a7a" />
        </div>
        <div className="absolute bottom-4 left-4 opacity-20 pointer-events-none hidden lg:block">
          <Constellation className="w-28 h-22" />
        </div>
        <div className="nebula-float absolute top-0 right-0 w-[350px] h-[250px] rounded-full bg-[#4B0082]/8 blur-[90px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <HookTicker />
            <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Ilmu Numerologi &amp; Weton</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Mengapa Nama &amp; Tanda Tangan Sangat Penting?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#D4AF37]/15 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F3E5AB] mb-3">Fungsi Nama Panggilan Hoki</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                Nama panggilan dengan vibrasi angka hoki berfungsi menyelaraskan energi kosmik tubuh dengan magnet rezeki.
                Dalam bisnis dan karir, nama panggilan yang hoki meningkatkan personal branding, mempercepat datangnya peluang,
                membangun kepercayaan klien, dan memancarkan frekuensi kemakmuran yang harmonis dengan alam semesta.
              </p>
              <div className="mt-6 space-y-2">
                {['Meningkatkan personal branding', 'Mempercepat datangnya peluang', 'Membangun kepercayaan klien', 'Memancarkan frekuensi kemakmuran'].map(i => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] flex-shrink-0" />
                    <span className="text-white font-semibold">{i}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#4B0082]/30 rounded-3xl p-8">
              <div className="w-12 h-12 rounded-2xl bg-[#4B0082]/20 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-[#9b59b6]" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#F3E5AB] mb-3">Garis Tanda Tangan Hoki</h3>
              <p className="text-white/60 leading-relaxed text-sm mb-4">
                Setiap orang memiliki getaran nama yang unik. Tanda tangan hokimu dirancang selaras dengan nama panggilan pilihan — sehingga setiap kali kamu membubuhkan tanda tangan, energi keberuntungan dari namamu ikut terpancar dan memperkuat daya tarik rezeki, kepercayaan orang lain, serta peluang yang datang padamu.
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: '✦', text: 'Memperkuat aura dan wibawa di hadapan orang lain' },
                  { icon: '✦', text: 'Menyelaraskan energi nama hoki dengan identitas resmimu' },
                  { icon: '✦', text: 'Membuka pintu rezeki, jabatan, dan kepercayaan yang lebih besar' },
                  { icon: '✦', text: 'Menjadi "segel pribadi" yang memancarkan getaran kemakmuran' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#D4AF37] text-xs mt-0.5 flex-shrink-0">{item.icon}</span>
                    <p className="text-white font-semibold text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { val: '10K+', label: 'Pengguna' },
              { val: '98%', label: 'Kepuasan' },
              { val: '5★', label: 'Rating' },
            ].map(s => (
              <div key={s.label} className="text-center py-6 bg-[#1F2833]/50 border border-white/5 rounded-2xl">
                <div className="text-3xl font-bold text-[#D4AF37] font-serif">{s.val}</div>
                <div className="text-white/40 text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLES ── */}
      <section className="relative py-20 px-4 bg-[#0B0C10] overflow-hidden">
        <SpaceBackground count={55} showShooters={false} />
        {/* Large distant moon peek — top left */}
        <div className="absolute -top-20 -left-20 opacity-15 pointer-events-none hidden lg:block">
          <Moon className="w-72 h-72" />
        </div>
        <div className="nebula-float-delay absolute top-1/2 right-0 w-[280px] h-[280px] rounded-full bg-[#D4AF37]/6 blur-[80px] pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Contoh Hasil Analisis</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
              Transformasi Nama Nyata
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {EXAMPLE_CARDS.map(card => (
              <div
                key={card.namaAsli}
                className="bg-gradient-to-br from-[#1F2833] to-[#0d1017] border border-[#D4AF37]/20 rounded-3xl p-7 hover:border-[#D4AF37]/40 transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-white/40 text-xs mb-1">Nama Asli</div>
                    <div className="text-white/70 text-sm line-through decoration-red-400/60">{card.namaAsli}</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-[#D4AF37]" />
                  <div className="text-right">
                    <div className="text-[#D4AF37] text-xs mb-1">Nama Hoki</div>
                    <div className="text-[#F3E5AB] text-lg font-bold font-serif">{card.namaPanggilan}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] font-bold text-lg">
                    {card.angka}
                  </div>
                  <div>
                    <div className="text-[#F3E5AB] font-semibold text-sm">Vibrasi Angka {card.angka}</div>
                    <div className="text-white/40 text-xs">{card.label}</div>
                  </div>
                </div>

                <p className="text-white/55 text-sm leading-relaxed mb-6">{card.desc}</p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="relative py-20 px-4 bg-[#0d0e18] overflow-hidden">
        <SpaceBackground count={40} showShooters={false} />
        <div className="nebula-float absolute -top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#D4AF37]/6 blur-[100px] pointer-events-none" />
        <div className="absolute top-10 right-6 opacity-25 pointer-events-none hidden md:block">
          <Constellation className="w-32 h-24" />
        </div>
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Layanan Premium</p>
            <h2 className="font-serif text-3xl font-bold text-white">Investasi Terkecil untuk</h2>
            <h2 className="font-serif text-3xl font-bold text-[#D4AF37]">Kemakmuran Seumur Hidup</h2>
          </div>

          <div className="bg-gradient-to-br from-[#1F2833] to-[#0d1017] border-2 border-[#D4AF37]/40 rounded-3xl p-8 shadow-2xl shadow-[#D4AF37]/10">
            <div className="text-center mb-8">
              <div className="text-white/40 text-sm mb-2">Analisis Lengkap Nama Hoki</div>
              <div className="text-5xl font-bold text-[#D4AF37] font-serif">Rp 100.000</div>
              <div className="text-white/30 text-sm mt-2">Sekali bayar, hasil seumur hidup</div>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'Analisis Numerologi Lengkap',
                'Perhitungan Weton Jawa',
                'Saran Nama Panggilan Hoki',
                'Desain Tanda Tangan Hoki Eksklusif',
                'Laporan Angka Keberuntungan',
                'Panduan Hari &amp; Warna Hoki',
                'Rekap Hasil Otomatis via Email',
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
                  <span className="text-white/70 text-sm" dangerouslySetInnerHTML={{ __html: f }} />
                </div>
              ))}
            </div>

            <button
              onClick={scrollToForm}
              className="btn-hoki-pulse w-full py-4 rounded-2xl text-[#0B0C10] font-black text-base overflow-hidden hover:scale-[1.02] transition-transform duration-300"
              style={{
                background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
                backgroundSize: '200% auto',
                animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
              }}
            >
              Daftar Sekarang — Rp 100.000
            </button>

            <div className="mt-5 text-center text-white/30 text-xs">
              Pembayaran aman via QRIS, Transfer Bank, atau Virtual Account
            </div>
          </div>

          <div
            className="mt-6 p-5 rounded-2xl border"
            style={{
              background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 100%)',
              animation: 'aff-border-pulse 2.5s ease-in-out infinite',
            }}
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div>
                <div className="text-[#D4AF37] font-black text-base tracking-wide">Transfer Manual: BCA</div>
                <div className="text-[#F3E5AB] font-bold text-lg tracking-widest mt-0.5">8023036183</div>
                <div className="text-[#D4AF37]/70 text-sm font-semibold mt-0.5">a.n. Heni Setiyowati</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── REGISTRATION FORM ── */}
      <section ref={formRef} className="relative py-20 px-4 bg-[#0B0C10] overflow-hidden" id="form-daftar">
        <SpaceBackground count={60} showShooters />
        {/* Glowing moon behind form */}
        <div className="absolute top-8 right-4 md:right-16 opacity-20 pointer-events-none hidden sm:block">
          <Moon className="w-48 h-48" />
        </div>
        <div className="nebula-float absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full bg-[#4B0082]/10 blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#D4AF37] text-sm font-semibold uppercase tracking-widest mb-3">Mulai Perjalananmu</p>
            <h2 className="font-serif text-3xl font-bold text-white">Daftar Analisis Nama Hoki</h2>
            <p className="text-white/40 text-sm mt-3">Isi form di bawah — hasil analisis akan dikirim otomatis ke email Anda</p>
          </div>

          <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#D4AF37]/20 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={form.nama_lengkap}
                    onChange={handleChange}
                    placeholder="Masukkan nama lengkap sesuai KTP"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm"
                    required
                  />
                </div>
              </div>

              {/* Tanggal Lahir */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  Tanggal Lahir <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={form.tanggal_lahir}
                    onChange={handleChange}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@contoh.com"
                    className="w-full bg-[#0B0C10] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm"
                    required
                  />
                </div>
                <p className="text-white/25 text-xs mt-1.5 pl-1">Rekap hasil analisis akan dikirim ke email ini secara otomatis</p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-[#0B0C10] font-black text-base disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2 overflow-hidden"
                style={loading ? { background: 'linear-gradient(90deg, #D4AF37, #b8920e)' } : {
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
                  backgroundSize: '200% auto',
                  animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#0B0C10]/30 border-t-[#0B0C10] rounded-full animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Lanjut ke Pembayaran
                  </>
                )}
              </button>

              <div
                className="p-5 rounded-2xl border"
                style={{
                  background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 100%)',
                  animation: 'aff-border-pulse 2.5s ease-in-out infinite',
                }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <div className="text-[#D4AF37] font-black text-base tracking-wide">Transfer Manual: BCA</div>
                    <div className="text-[#F3E5AB] font-bold text-lg tracking-widest mt-0.5">8023036183</div>
                    <div className="text-[#D4AF37]/70 text-sm font-semibold mt-0.5">a.n. Heni Setiyowati</div>
                  </div>
                </div>
              </div>

              <p className="text-center text-white/25 text-xs">
                Data Anda aman &amp; hanya digunakan untuk analisis numerologi personal
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
