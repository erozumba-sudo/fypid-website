import { useState } from 'react';
import {
  Users, Link, TrendingUp, DollarSign, Copy, CheckCircle,
  ArrowLeft, Sparkles, User, Mail, Star, Zap, MapPin, Phone,
  CreditCard, Gift, Shield, Send, Clock,
} from 'lucide-react';
import { supabase, Affiliator } from '../lib/supabase';

interface AffiliatePageProps {
  onBack: () => void;
}

type Stage = 'info' | 'register' | 'paying' | 'dashboard';

function genCode(name: string, email: string): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const seed = (name + email).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  let code = 'AFF';
  for (let i = 0; i < 5; i++) code += chars[(seed * (i + 7)) % chars.length];
  return code;
}

const INPUT_CLASS =
  'w-full bg-[#0B0C10] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-[#D4AF37]/50 transition-colors text-sm';

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}
function Field({ icon, label, required, children, hint }: FieldProps) {
  return (
    <div>
      <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none">
          {icon}
        </div>
        {children}
      </div>
      {hint && <p className="text-white/25 text-xs mt-1.5 pl-1">{hint}</p>}
    </div>
  );
}

export default function AffiliatePage({ onBack }: AffiliatePageProps) {
  const [stage, setStage] = useState<Stage>('info');
  const [form, setForm] = useState({
    nama: '',
    alamat: '',
    nomer_hp: '',
    email: '',
    no_rekening: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [affiliator, setAffiliator] = useState<Affiliator | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.nama || !form.alamat || !form.nomer_hp || !form.email || !form.no_rekening) {
      setError('Harap lengkapi semua field yang wajib diisi.');
      return;
    }
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('affiliators')
        .select('id')
        .eq('email', form.email)
        .maybeSingle();
      if (existing) {
        setError('Email sudah terdaftar. Gunakan fitur Login di bawah.');
        return;
      }

      // Referral code generated but HIDDEN until after payment
      const kode = genCode(form.nama, form.email);

      const payload: Affiliator = {
        nama_affiliator: form.nama,
        email: form.email,
        nomer_hp: form.nomer_hp,
        alamat: form.alamat,
        no_rekening: form.no_rekening,
        kode_referral: kode,
        total_klik: 0,
        total_konversi: 0,
        total_komisi: 0,
        status_akun: 'pending',
      };

      const { data, error: dbErr } = await supabase
        .from('affiliators')
        .insert(payload)
        .select()
        .single();

      if (dbErr) throw dbErr;
      if (!data) throw new Error('Gagal mendaftar.');

      const saved = data as Affiliator & { id: string };
      setAffiliator(saved);

      // Kirim ke n8n → Midtrans + Blackbox AI
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
      if (webhookUrl) {
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              nama_lengkap: form.nama,
              alamat: form.alamat,
              whatsapp: form.nomer_hp,
              email: form.email,
              rekening: form.no_rekening,
              kode_referral: kode,
              affiliator_id: saved.id,
            }),
          });
          const result = await response.json();
          if (result.redirect_url) {
            window.location.href = result.redirect_url;
            return;
          }
        } catch {
          // n8n tidak bisa dihubungi — lanjut ke halaman transfer manual
        }
      }

      setStage('paying');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePayAffiliator() {
    if (!affiliator?.id) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 2200));
    await supabase.from('affiliators').update({ status_akun: 'active' }).eq('id', affiliator.id);
    setAffiliator(a => a ? { ...a, status_akun: 'active' } : a);
    setLoading(false);
    setStage('dashboard');
  }

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setLookupError('');
    setLookupLoading(true);
    try {
      const { data } = await supabase
        .from('affiliators')
        .select('*')
        .eq('email', lookupEmail.trim())
        .maybeSingle();
      if (!data) { setLookupError('Email tidak ditemukan.'); return; }
      setAffiliator(data as Affiliator);
      setStage('dashboard');
    } catch {
      setLookupError('Gagal memuat data.');
    } finally {
      setLookupLoading(false);
    }
  }

  function copyLink() {
    if (!affiliator?.kode_referral) return;
    navigator.clipboard.writeText(`https://namahoki.com/?ref=${affiliator.kode_referral}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  // ── INFO PAGE ────────────────────────────────────────────────
  if (stage === 'info') {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
          </button>

          {/* ── HERO HOOK ── */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F3E5AB] text-xs font-semibold uppercase tracking-widest mb-5">
              <Sparkles className="w-3.5 h-3.5" /> Program Afiliasi Eksklusif — Terbuka untuk Umum
            </div>
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
              Cukup Share Link,{' '}
              <span className="bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">
                Uang Masuk Sendiri
              </span>
            </h1>
            <p className="text-white/65 text-lg max-w-2xl mx-auto leading-relaxed mb-3">
              Bergabunglah dengan ratusan affiliator yang sudah menghasilkan{' '}
              <strong className="text-[#D4AF37]">Rp 300.000 – Rp 1.500.000 per bulan</strong>{' '}
              hanya dengan menyebarkan link ke grup WhatsApp, TikTok, dan Instagram.
            </p>
            <p className="text-white/40 text-sm">
              Tidak perlu jualan keras. Tidak perlu stok produk. Cukup satu link — komisi mengalir otomatis.
            </p>
          </div>

          {/* ── URGENCY BANNER ── */}
          <div className="bg-gradient-to-r from-red-900/30 to-orange-900/20 border border-red-500/25 rounded-2xl px-6 py-4 mb-8 flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <div className="text-red-300 font-bold text-sm">Slot Affiliator Terbatas di Setiap Kota!</div>
              <div className="text-white/45 text-xs mt-0.5">
                Kami membatasi jumlah affiliator per wilayah agar komisimu tidak terdilusi. Daftar sekarang sebelum slot kotamu penuh.
              </div>
            </div>
          </div>

          {/* ── 3 STEPS ── */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: Users, step: '01', title: 'Daftar Sekali',
                desc: 'Modal hanya Rp 50.000 — investasi terkecil untuk penghasilan pasif jangka panjang. Langsung dapat kode referral unik.',
              },
              {
                icon: Link, step: '02', title: 'Sebar Link Referral',
                desc: 'Copy link, paste di WhatsApp, TikTok, Instagram, Telegram. Setiap yang klik lewat linkmu otomatis tercatat.',
              },
              {
                icon: DollarSign, step: '03', title: 'Komisi Masuk Otomatis',
                desc: 'Rp 30.000 langsung ditransfer ke rekeningmu setiap ada yang berhasil bayar lewat linkmu. Tanpa target minimum.',
              },
            ].map(s => (
              <div key={s.step} className="bg-[#1F2833]/60 border border-white/8 rounded-3xl p-6 text-center hover:border-[#D4AF37]/20 transition-colors">
                <div className="text-[#D4AF37]/25 text-4xl font-bold font-serif mb-3">{s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mx-auto mb-4">
                  <s.icon className="w-5 h-5 text-[#D4AF37]" />
                </div>
                <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* ── INCOME CALCULATOR ── */}
          <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#D4AF37]/20 rounded-3xl p-8 mb-6">
            <h3 className="font-serif text-xl font-bold text-white mb-2 text-center">Hitung Potensi Penghasilanmu</h3>
            <p className="text-white/40 text-xs text-center mb-6">Berapa orang bisa kamu ajak per bulan?</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { orang: 10, label: 'Kasual', sub: '(grup kecil)', warna: 'text-sky-400', bg: 'bg-sky-500/8 border-sky-500/20' },
                { orang: 30, label: 'Aktif', sub: '(beberapa grup)', warna: 'text-emerald-400', bg: 'bg-emerald-500/8 border-emerald-500/20' },
                { orang: 100, label: 'Serius', sub: '(konten kreator)', warna: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/8 border-[#D4AF37]/20' },
              ].map(tier => (
                <div key={tier.orang} className={`text-center p-4 rounded-2xl border ${tier.bg}`}>
                  <div className={`text-2xl font-bold font-serif ${tier.warna}`}>
                    Rp {(tier.orang * 30000).toLocaleString('id-ID')}
                  </div>
                  <div className={`text-xs font-semibold mt-1 ${tier.warna}`}>{tier.label}</div>
                  <div className="text-white/30 text-xs">{tier.orang} orang {tier.sub}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-5 bg-[#D4AF37]/8 border border-[#D4AF37]/20 rounded-2xl">
                <div className="text-3xl font-bold text-[#D4AF37] font-serif">70%</div>
                <div className="text-[#F3E5AB] font-semibold mt-1 text-sm">Owner</div>
                <div className="text-white/35 text-xs">Rp 70.000 / penjualan</div>
              </div>
              <div className="text-center p-5 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl">
                <div className="text-3xl font-bold text-emerald-400 font-serif">30%</div>
                <div className="text-emerald-300 font-semibold mt-1 text-sm">Kamu (Affiliator)</div>
                <div className="text-white/35 text-xs">Rp 30.000 / penjualan</div>
              </div>
            </div>
          </div>

          {/* ── WHY JOIN ── */}
          <div className="grid md:grid-cols-2 gap-3 mb-8">
            {[
              { icon: CheckCircle, title: 'Tanpa Modal Besar', desc: 'Cukup Rp 50.000 sekali. Tidak ada biaya bulanan, tidak ada target.' },
              { icon: CheckCircle, title: 'Produk Viral Sendiri', desc: 'Nama hoki & weton Jawa sudah viral organik di TikTok — mudah dijual.' },
              { icon: CheckCircle, title: 'Komisi Seumur Hidup', desc: 'Selama akun aktif, kode referralmu terus bekerja 24 jam sehari.' },
              { icon: CheckCircle, title: 'Cocok Semua Kalangan', desc: 'Ibu rumah tangga, mahasiswa, karyawan, guru, pedagang — semua bisa.' },
            ].map(w => (
              <div key={w.title} className="flex items-start gap-3 bg-[#1F2833]/40 border border-white/6 rounded-2xl p-5">
                <w.icon className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-white font-semibold text-sm">{w.title}</div>
                  <div className="text-white/45 text-xs mt-0.5 leading-relaxed">{w.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── TESTIMONIALS ── */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-bold text-white text-center mb-4">Kata Mereka yang Sudah Bergabung</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { nama: 'Sari W., Surabaya', komisi: 'Rp 480.000 bulan pertama', teks: '"Awalnya iseng share ke grup ibu-ibu PKK. Eh ternyata banyak yang tertarik. Alhamdulillah bulan pertama sudah balik modal berkali-kali!"' },
                { nama: 'Rendi P., Jakarta', komisi: 'Rp 1.200.000 / bulan', teks: '"Saya kasih info nama hoki di TikTok, banyak yang penasaran. Link saya taruh di bio. Komisi masuk hampir tiap hari tanpa saya harus online terus."' },
                { nama: 'Mbak Dewi, Jogja', komisi: 'Rp 270.000 minggu pertama', teks: '"Yang bikin saya suka: produknya memang beneran viral, jadi orang yang klik link saya mudah langsung beli. Tidak perlu bujuk-bujuk."' },
                { nama: 'Pak Hendra, Semarang', komisi: 'Rp 900.000 / bulan', teks: '"Saya pensiunan yang tidak terlalu paham medsos. Tapi cukup share ke grup WA keluarga dan teman kantor lama, sudah cukup menghasilkan."' },
              ].map(t => (
                <div key={t.nama} className="bg-[#1F2833]/50 border border-white/6 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />)}
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed italic mb-3">{t.teks}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/50 text-xs font-semibold">{t.nama}</span>
                    <span className="text-emerald-400 text-xs font-bold">{t.komisi}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="bg-gradient-to-br from-[#D4AF37]/10 to-[#b8920e]/5 border border-[#D4AF37]/25 rounded-3xl p-8 text-center mb-6">
            <div className="text-[#D4AF37] font-bold text-sm uppercase tracking-widest mb-2">Mulai Hasilkan Uang Hari Ini</div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Daftar Sekarang — Bayar Sekali Seumur Hidup
            </h2>
            <p className="text-white/45 text-sm mb-6 max-w-md mx-auto">
              Hanya <strong className="text-[#D4AF37]">Rp 50.000</strong> untuk membuka akses ke kode referral eksklusifmu.
              Tidak ada biaya lanjutan. Tidak ada target penjualan.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              <button
                onClick={() => setStage('register')}
                className="py-4 rounded-2xl text-[#0B0C10] font-black text-base hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2 overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
                  backgroundSize: '200% auto',
                  animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
                }}
              >
                <Star className="w-5 h-5" />
                Daftar Jadi Affiliator — Rp 50.000
              </button>
              <button
                onClick={() => document.getElementById('aff-login')?.scrollIntoView({ behavior: 'smooth' })}
                className="py-4 rounded-2xl border border-white/15 text-white/60 hover:border-[#D4AF37]/30 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm"
              >
                <TrendingUp className="w-4 h-4" />
                Sudah punya akun? Login dashboard
              </button>
            </div>
          </div>

          {/* ── FAQ SINGKAT ── */}
          <div className="mb-8 space-y-3">
            <h3 className="font-serif text-lg font-bold text-white text-center mb-5">Pertanyaan Umum</h3>
            {[
              { q: 'Apakah ada target penjualan minimal?', a: 'Tidak ada. Komisi dibayar per transaksi yang masuk lewat linkmu, tanpa syarat target bulanan.' },
              { q: 'Kapan komisi dibayarkan?', a: 'Komisi dikirim ke rekening yang kamu daftarkan setiap kali ada pembayaran yang berhasil diverifikasi, biasanya dalam 1×24 jam.' },
              { q: 'Apakah kode referral bisa kadaluarsa?', a: 'Tidak. Kode referralmu berlaku seumur hidup selama akun affiliator aktif.' },
              { q: 'Apa yang membuat produk ini mudah dijual?', a: 'Nama hoki & weton Jawa sudah viral organik di TikTok dan Instagram. Ribuan orang mencari secara aktif setiap hari — tugasmu hanya mengarahkan mereka ke linkmu.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-[#1F2833]/40 border border-white/6 rounded-2xl px-5 py-4 cursor-pointer">
                <summary className="text-white font-semibold text-sm list-none flex items-center justify-between gap-3">
                  {faq.q}
                  <span className="text-[#D4AF37] text-lg leading-none group-open:rotate-45 transition-transform inline-block">+</span>
                </summary>
                <p className="text-white/50 text-sm mt-3 leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>

          {/* ── LOGIN ── */}
          <div id="aff-login" className="bg-[#1F2833]/40 border border-white/8 rounded-3xl p-6">
            <h3 className="text-white/60 font-semibold text-sm mb-4">Login ke Dashboard Affiliator</h3>
            <form onSubmit={handleLookup} className="flex gap-3">
              <input
                type="email"
                value={lookupEmail}
                onChange={e => setLookupEmail(e.target.value)}
                placeholder="Email affiliator terdaftar"
                className="flex-1 bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[#D4AF37]/50"
              />
              <button type="submit" disabled={lookupLoading} className="px-5 py-3 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37]/30 transition-colors disabled:opacity-50">
                {lookupLoading ? '...' : 'Masuk'}
              </button>
            </form>
            {lookupError && <p className="text-red-400 text-xs mt-2">{lookupError}</p>}
          </div>
        </div>
      </div>
    );
  }

  // ── REGISTER ─────────────────────────────────────────────────
  if (stage === 'register') {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setStage('info')} className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-8 text-sm">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-4">
              <Gift className="w-3.5 h-3.5" /> Kode referral dikirim setelah pembayaran
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Daftar Affiliator</h1>
            <p className="text-white/50 text-sm">Isi data dirimu dengan lengkap &amp; benar</p>
          </div>

          <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#D4AF37]/20 rounded-3xl p-8">
            <form onSubmit={handleRegister} className="space-y-5">

              <Field icon={<User className="w-4 h-4" />} label="Nama Lengkap" required>
                <input
                  name="nama"
                  value={form.nama}
                  onChange={handleFormChange}
                  placeholder="Nama lengkap sesuai KTP"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field icon={<MapPin className="w-4 h-4" />} label="Alamat" required hint="Alamat lengkap domisili">
                <input
                  name="alamat"
                  value={form.alamat}
                  onChange={handleFormChange}
                  placeholder="Jl. Contoh No. 1, Kota, Provinsi"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field icon={<Phone className="w-4 h-4" />} label="Nomor WhatsApp" required hint="Digunakan untuk konfirmasi pembayaran & koordinasi komisi">
                <input
                  name="nomer_hp"
                  type="tel"
                  value={form.nomer_hp}
                  onChange={handleFormChange}
                  placeholder="08xxxxxxxxxx"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field icon={<Mail className="w-4 h-4" />} label="Email" required hint="Kode referral dan notifikasi komisi dikirim ke email ini">
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleFormChange}
                  placeholder="email@contoh.com"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field icon={<CreditCard className="w-4 h-4" />} label="Nomor Rekening" required hint="Format: BCA / BNI / Mandiri — 1234567890 a.n. Nama">
                <input
                  name="no_rekening"
                  value={form.no_rekening}
                  onChange={handleFormChange}
                  placeholder="BCA — 1234567890 a.n. Nama Lengkap"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white/70 text-sm">Biaya Pendaftaran Affiliator</span>
                  <span className="text-[#D4AF37] font-bold text-lg">Rp 50.000</span>
                </div>
                <div className="text-white/30 text-xs">Bayar sekali, aktif selamanya — kode referral langsung aktif setelah bayar</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-[#0B0C10] font-black text-base disabled:opacity-50 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2 overflow-hidden"
                style={loading ? { background: 'linear-gradient(90deg, #D4AF37, #b8920e)' } : {
                  background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
                  backgroundSize: '200% auto',
                  animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
                }}
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-[#0B0C10]/30 border-t-[#0B0C10] rounded-full animate-spin" /> Menyimpan...</>
                  : <><Sparkles className="w-5 h-5" /> Lanjut ke Pembayaran</>
                }
              </button>

              <div
                className="rounded-2xl border p-4 mt-1"
                style={{
                  background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 100%)',
                  animation: 'aff-border-pulse 2.5s ease-in-out infinite',
                }}
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
                  <div>
                    <div className="text-[#D4AF37] font-black text-base tracking-wide">Transfer Manual: BCA</div>
                    <div className="text-[#F3E5AB] font-bold text-xl tracking-widest">8023036183</div>
                    <div className="text-[#D4AF37]/70 text-sm font-semibold mt-0.5">a.n. Heni Setiyowati</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── PAYING ───────────────────────────────────────────────────
  if (stage === 'paying') {
    const waMsg = encodeURIComponent(
      `Halo, saya sudah transfer Rp 50.000 untuk aktivasi akun affiliator.\n\nNama: ${affiliator?.nama_affiliator}\nEmail: ${affiliator?.email}\nWA: ${affiliator?.nomer_hp}\n\nMohon dikonfirmasi, terima kasih!`
    );
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
        <div className="max-w-lg mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#F3E5AB] text-xs font-semibold uppercase tracking-widest mb-5">
              <Shield className="w-3.5 h-3.5" /> Langkah Terakhir — Pembayaran
            </div>
            <h1 className="font-serif text-3xl font-bold text-white mb-2">Selesaikan Pembayaran</h1>
            <p className="text-white/50 text-sm">Transfer <strong className="text-[#D4AF37]">Rp 50.000</strong> ke rekening di bawah untuk mengaktifkan akun affiliatormu</p>
          </div>

          {/* Registrant summary */}
          <div className="bg-[#1F2833]/60 border border-white/8 rounded-2xl px-5 py-4 mb-5 text-sm space-y-1.5">
            <div className="flex gap-3"><span className="text-white/30 w-20 shrink-0">Nama</span><span className="text-white font-medium">{affiliator?.nama_affiliator}</span></div>
            <div className="flex gap-3"><span className="text-white/30 w-20 shrink-0">WhatsApp</span><span className="text-white">{affiliator?.nomer_hp}</span></div>
            <div className="flex gap-3"><span className="text-white/30 w-20 shrink-0">Email</span><span className="text-white">{affiliator?.email}</span></div>
          </div>

          {/* BCA Card — main CTA */}
          <div
            className="rounded-3xl p-6 mb-5"
            style={{
              background: 'linear-gradient(135deg, #1a1507 0%, #2d1e04 60%, #1a1507 100%)',
              border: '2px solid transparent',
              backgroundClip: 'padding-box',
              animation: 'aff-border-pulse 2.5s ease-in-out infinite',
              boxShadow: '0 0 30px rgba(212,175,55,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <span className="text-[#D4AF37] font-black text-sm uppercase tracking-widest">Transfer Manual BCA</span>
            </div>

            <div className="mb-4">
              <div className="text-white/35 text-xs uppercase tracking-wider mb-1">Nomor Rekening</div>
              <div className="text-[#F3E5AB] font-black text-4xl tracking-[0.15em] font-mono">8023036183</div>
            </div>

            <div className="mb-5">
              <div className="text-white/35 text-xs uppercase tracking-wider mb-1">Atas Nama</div>
              <div className="text-white font-bold text-lg">Heni Setiyowati</div>
            </div>

            <div className="border-t border-[#D4AF37]/20 pt-4 flex items-center justify-between">
              <span className="text-white/50 text-sm">Jumlah Transfer</span>
              <span className="text-[#D4AF37] font-black text-2xl">Rp 50.000</span>
            </div>
          </div>

          {/* Auto-send info */}
          <div className="bg-emerald-500/8 border border-emerald-500/20 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-emerald-400 font-bold text-sm">Kode Referral Dikirim Otomatis</div>
              <div className="text-white/50 text-xs mt-0.5 leading-relaxed">
                Setelah transfer dikonfirmasi, kode referral unikmu langsung dikirim otomatis ke WhatsApp &amp; email terdaftar. Biasanya dalam 1×15 menit.
              </div>
            </div>
          </div>

          {/* Blurred referral teaser */}
          <div className="bg-[#1F2833]/60 border border-[#D4AF37]/15 rounded-2xl px-5 py-4 mb-6 text-center">
            <div className="text-white/35 text-xs mb-2 uppercase tracking-wider">Kode Referral Unikmu (aktif setelah bayar)</div>
            <div className="relative inline-block">
              <div className="text-2xl font-bold text-[#D4AF37] font-mono tracking-widest select-none blur-sm">
                {affiliator?.kode_referral}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/60 text-xs font-semibold bg-[#1F2833]/90 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Transfer dulu ↑</span>
              </div>
            </div>
          </div>

          {/* Confirm button */}
          <button
            onClick={handlePayAffiliator}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-[#0B0C10] font-black text-base disabled:opacity-50 hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2 overflow-hidden mb-3"
            style={loading ? { background: 'linear-gradient(90deg, #D4AF37, #b8920e)' } : {
              background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
              backgroundSize: '200% auto',
              animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
            }}
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-[#0B0C10]/30 border-t-[#0B0C10] rounded-full animate-spin" /> Mengaktifkan Akun...</>
              : <><CheckCircle className="w-5 h-5" /> Konfirmasi — Saya Sudah Transfer</>
            }
          </button>

          {/* WhatsApp konfirmasi backup */}
          <a
            href={`https://wa.me/6281234567890?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl border border-emerald-500/30 text-emerald-400 font-semibold text-sm hover:bg-emerald-500/10 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" /> Konfirmasi via WhatsApp (opsional)
          </a>

          <p className="text-white/25 text-xs text-center mt-4 leading-relaxed">
            Butuh bantuan? Hubungi kami via WhatsApp di atas dengan menyertakan bukti transfer.
          </p>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ─────────────────────────────────────────────────
  const refLink = `https://namahoki.com/?ref=${affiliator?.kode_referral || ''}`;
  const isActive = affiliator?.status_akun === 'active';

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>

        {/* Welcome banner — kode referral revealed here */}
        {isActive && (
          <div className="bg-gradient-to-r from-[#D4AF37]/15 to-emerald-500/10 border border-[#D4AF37]/30 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/20 flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[#D4AF37] font-bold text-sm">Selamat! Akun affiliatormu aktif.</div>
              <div className="text-white/50 text-xs mt-0.5">Kode referralmu sudah bisa dipakai. Mulai bagikan link &amp; raih komisi!</div>
            </div>
          </div>
        )}

        {/* Header card */}
        <div className="bg-gradient-to-br from-[#1F2833] to-[#0d1017] border border-[#D4AF37]/20 rounded-3xl p-7 mb-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="text-white/40 text-xs uppercase tracking-wider mb-1">Dashboard Affiliator</div>
              <h1 className="font-serif text-2xl font-bold text-white">{affiliator?.nama_affiliator}</h1>
              <div className="text-white/50 text-sm">{affiliator?.email}</div>
              {affiliator?.nomer_hp && <div className="text-white/35 text-xs mt-0.5">WA: {affiliator.nomer_hp}</div>}
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'}`}>
              {isActive ? '● Aktif' : '● Menunggu Aktivasi'}
            </div>
          </div>

          {/* Kode referral — prominently shown after payment */}
          <div className="bg-[#D4AF37]/8 border border-[#D4AF37]/25 rounded-2xl px-5 py-4 mb-4">
            <div className="text-white/40 text-xs mb-1">Kode Referral Eksklusifmu</div>
            <div className="text-2xl font-bold text-[#D4AF37] font-mono tracking-widest">
              {affiliator?.kode_referral}
            </div>
          </div>

          {/* Referral link */}
          <div>
            <div className="text-white/40 text-xs mb-2">Link Referral Unikmu</div>
            <div className="flex items-center gap-2 bg-[#0B0C10] border border-[#D4AF37]/20 rounded-xl px-4 py-3">
              <Link className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-[#F3E5AB] text-sm flex-1 truncate font-mono">{refLink}</span>
              <button onClick={copyLink} className="text-[#D4AF37] hover:text-[#F3E5AB] transition-colors flex-shrink-0">
                {copiedLink ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {copiedLink && <p className="text-emerald-400 text-xs mt-1">Link berhasil disalin!</p>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Klik', val: affiliator?.total_klik ?? 0, icon: TrendingUp, color: 'text-sky-400' },
            { label: 'Konversi', val: affiliator?.total_konversi ?? 0, icon: Users, color: 'text-emerald-400' },
            { label: 'Total Komisi', val: `Rp ${(affiliator?.total_komisi ?? 0).toLocaleString('id-ID')}`, icon: DollarSign, color: 'text-[#D4AF37]' },
          ].map(s => (
            <div key={s.label} className="bg-[#1F2833]/60 border border-white/8 rounded-2xl p-5">
              <s.icon className={`w-5 h-5 ${s.color} mb-3`} />
              <div className={`text-xl font-bold ${s.color} font-serif`}>{s.val}</div>
              <div className="text-white/30 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rekening info */}
        {affiliator?.no_rekening && (
          <div className="bg-[#1F2833]/40 border border-white/8 rounded-2xl px-6 py-4 mb-6 flex items-center gap-4 text-sm">
            <CreditCard className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
            <div>
              <div className="text-white/40 text-xs">Rekening Komisi</div>
              <div className="text-white font-medium">{affiliator.no_rekening}</div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="bg-[#1F2833]/40 border border-white/8 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-[#D4AF37]" />
            <h3 className="text-white font-semibold text-sm">Tips Viral Untuk Affiliator</h3>
          </div>
          <div className="space-y-3">
            {[
              'Posting di TikTok & Instagram Reels dengan hashtag #namahokilagi #wetonjawa #numerologi',
              'Kirim link ke grup WhatsApp keluarga & komunitas bisnis',
              'Buat konten "nama hoki bulan ini" untuk menarik lebih banyak klik',
              'Tambahkan link referral di bio Instagram & TikTok',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2.5 text-sm text-white/55">
                <div className="w-5 h-5 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                {tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
