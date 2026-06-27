import { useState } from 'react';
import {
  CheckCircle, ArrowLeft, Copy,
  Sparkles, Star, TrendingUp, BookOpen, Clock, Palette, Briefcase, Gem, Shield,
} from 'lucide-react';
import { supabase, Registration } from '../lib/supabase';
import { analyzeNumerology } from '../lib/numerology';
import SignatureCanvas from '../components/SignatureCanvas';

interface CheckoutProps {
  registration: Registration & { id: string };
  onSuccess: () => void;
  onBack: () => void;
}

type Stage = 'select' | 'processing' | 'success';

const PRICE = 100000;

function Section({
  number,
  title,
  icon,
  children,
  accent = 'gold',
}: {
  number: number;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: 'gold' | 'purple' | 'teal';
}) {
  const accentStyles = {
    gold: 'border-[#D4AF37]/25 shadow-[#D4AF37]/5',
    purple: 'border-[#6d4c8a]/25 shadow-[#6d4c8a]/5',
    teal: 'border-[#2d6a5f]/25 shadow-[#2d6a5f]/5',
  };
  const numberStyles = {
    gold: 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/20',
    purple: 'bg-[#6d4c8a]/20 text-[#b899d4] border-[#6d4c8a]/25',
    teal: 'bg-[#2d6a5f]/20 text-[#7bbfb5] border-[#2d6a5f]/25',
  };
  const titleStyles = {
    gold: 'text-[#F3E5AB]',
    purple: 'text-[#c4a0d8]',
    teal: 'text-[#8dccc5]',
  };
  return (
    <div className={`bg-gradient-to-br from-[#1a1f2e] to-[#0d1017] border ${accentStyles[accent]} rounded-3xl p-7 mb-4 shadow-xl`}>
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-8 h-8 rounded-xl border flex items-center justify-center text-xs font-bold font-serif flex-shrink-0 ${numberStyles[accent]}`}>
          {number}
        </div>
        <div className="flex items-center gap-2">
          <span className={`${titleStyles[accent]} font-bold text-sm uppercase tracking-widest`}>{title}</span>
        </div>
        <div className={`h-px flex-1 ${accent === 'gold' ? 'bg-[#D4AF37]/15' : accent === 'purple' ? 'bg-[#6d4c8a]/15' : 'bg-[#2d6a5f]/15'}`} />
        <div className={`${titleStyles[accent]} opacity-60`}>{icon}</div>
      </div>
      {children}
    </div>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-[#0B0C10]/70 rounded-2xl p-4">
      <div className="text-white/30 text-xs mb-1">{label}</div>
      <div className="text-white font-bold text-xl font-serif leading-tight">{value}</div>
      {sub && <div className="text-white/30 text-xs mt-0.5">{sub}</div>}
    </div>
  );
}

export default function Checkout({ registration, onSuccess, onBack }: CheckoutProps) {
  const [stage, setStage] = useState<Stage>('select');
  const [copied, setCopied] = useState(false);

  const result = analyzeNumerology(registration.nama_lengkap, registration.tanggal_lahir);

  async function handlePay() {
    setStage('processing');
    await new Promise(r => setTimeout(r, 2800));

    await supabase
      .from('registrations')
      .update({ status_pembayaran: 'paid' })
      .eq('id', registration.id);

    if (registration.affiliator_id) {
      const { data: aff } = await supabase
        .from('affiliators')
        .select('total_konversi, total_komisi')
        .eq('id', registration.affiliator_id)
        .maybeSingle();
      if (aff) {
        await supabase
          .from('affiliators')
          .update({
            total_konversi: (aff.total_konversi ?? 0) + 1,
            total_komisi: (aff.total_komisi ?? 0) + 30000,
          })
          .eq('id', registration.affiliator_id);
      }
    }

    setStage('success');
  }

  function copyVA() {
    navigator.clipboard.writeText('8023036183');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (stage === 'processing') {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-8" />
          <h2 className="font-serif text-2xl font-bold text-white mb-3">Memproses Pembayaran</h2>
          <p className="text-white/50 text-sm">Menghubungkan ke gateway pembayaran...</p>
          <div className="mt-6 space-y-2 text-left bg-[#1F2833]/60 rounded-2xl p-4">
            {['Memverifikasi data pembayaran', 'Mengkonfirmasi transaksi', 'Menyusun laporan analisis metafisika'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 text-sm text-white/40">
                <div className={`w-4 h-4 rounded-full border-2 ${i === 0 ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-white/20'}`} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stage === 'success') {
    return (
      <div className="min-h-screen bg-[#0B0C10] text-white py-10 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Report header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#D4AF37] text-xs font-bold uppercase tracking-widest">Laporan Premium Eksklusif</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white mb-1">
              Laporan Analisis Metafisika
            </h1>
            <h2 className="font-serif text-2xl font-bold text-[#D4AF37] mb-3">
              & Potensi Diri Premium
            </h2>
            <p className="text-white/40 text-sm">
              Disusun khusus untuk <span className="text-white/70 font-medium">{registration.nama_lengkap}</span>
            </p>
          </div>

          {/* ── 1. ARTI NAMA LENGKAP ── */}
          <Section number={1} title="Arti Nama Lengkap" icon={<BookOpen className="w-4 h-4" />} accent="gold">
            <div className="flex items-start gap-4">
              <div>
                <div className="text-[#F3E5AB] font-serif font-bold text-xl mb-2">
                  {registration.nama_lengkap}
                </div>
                <p className="text-white/70 text-sm leading-relaxed capitalize mb-3">
                  {result.nameMeaning}
                </p>
                <p className="text-white/50 text-sm leading-relaxed">
                  Nama ini bukan sekadar identitas — ia adalah mantra yang diucapkan setiap hari oleh semesta untuk Anda. Setiap suku kata mengandung frekuensi energi yang bergetar dan membentuk medan daya tarik di sekeliling pemiliknya. Nama <span className="text-[#F3E5AB] font-semibold">{registration.nama_lengkap}</span> membawa doa dan harapan yang tersimpan dalam setiap hurufnya, memancar keluar sebagai aura yang orang lain rasakan saat pertama kali bertemu Anda.
                </p>
              </div>
            </div>
          </Section>

          {/* ── 2. SIFAT DAN KARAKTER ── */}
          <Section number={2} title="Sifat dan Karakter Berdasarkan Nama Lengkap" icon={<Star className="w-4 h-4" />} accent="purple">
            <p className="text-white/70 text-sm leading-relaxed">{result.personality}</p>
          </Section>

          {/* ── 3. ANALISIS NUMEROLOGI LENGKAP ── */}
          <Section number={3} title="Analisis Numerologi Lengkap" icon={<Sparkles className="w-4 h-4" />} accent="gold">
            {/* Life Path — hero number */}
            <div className="text-center bg-[#0B0C10]/60 rounded-2xl py-6 px-4 mb-4">
              <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-1">Life Path Number</div>
              <div className="text-8xl font-bold text-[#D4AF37] font-serif leading-none">{result.lifePath}</div>
              <div className="text-white/40 text-xs mt-2">Angka takdir utama — dihitung dari tanggal lahir penuh</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-[#0B0C10]/60 rounded-2xl p-4">
                <div className="text-white/30 text-xs mb-1">Expression Number</div>
                <div className="text-white font-bold text-3xl font-serif">{result.expressionNumber}</div>
                <div className="text-white/30 text-xs mt-1">Semua huruf nama — cermin potensi tersembunyi</div>
              </div>
              <div className="bg-[#0B0C10]/60 rounded-2xl p-4">
                <div className="text-white/30 text-xs mb-1">Soul Urge Number</div>
                <div className="text-[#F3E5AB] font-bold text-3xl font-serif">{result.soulUrgeNumber}</div>
                <div className="text-white/30 text-xs mt-1">Huruf vokal nama — dorongan jiwa terdalam</div>
              </div>
            </div>

            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-2xl p-4">
              <div className="text-white/30 text-xs mb-2">Makna Angka Takdir {result.lifePath}</div>
              <p className="text-white/65 text-sm leading-relaxed">
                Life Path {result.lifePath} menempatkan Anda pada jalur{' '}
                {result.lifePath === 1 ? 'kepemimpinan dan inovasi' :
                 result.lifePath === 2 ? 'diplomasi dan penyembuhan' :
                 result.lifePath === 3 ? 'kreativitas dan ekspresi diri' :
                 result.lifePath === 4 ? 'pembangunan dan kestabilan' :
                 result.lifePath === 5 ? 'kebebasan dan petualangan' :
                 result.lifePath === 6 ? 'harmoni dan pengabdian' :
                 result.lifePath === 7 ? 'kebijaksanaan dan spiritualitas' :
                 result.lifePath === 8 ? 'kemakmuran dan kekuasaan' : 'kemanusiaan dan warisan abadi'}.{' '}
                Kombinasi Expression Number {result.expressionNumber} dan Soul Urge {result.soulUrgeNumber} menunjukkan bahwa cara Anda meraih tujuan hidup adalah melalui{' '}
                {result.soulUrgeNumber <= 3 ? 'ekspresi kreatif dan komunikasi yang kuat' :
                 result.soulUrgeNumber <= 6 ? 'hubungan emosional yang dalam dan rasa tanggung jawab' : 'pencarian makna dan koneksi spiritual'}.
              </p>
            </div>
          </Section>

          {/* ── 4. PAST LIFE NUMBER ── */}
          <Section number={4} title="Past Life Number — Angka Kehidupan Masa Lalu" icon={<Clock className="w-4 h-4" />} accent="purple">
            <div className="flex items-start gap-5">
              <div className="text-center flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7b1fa2]/20 to-[#1a237e]/20 border border-[#7b1fa2]/20 flex items-center justify-center">
                  <span className="text-[#c4a0d8] font-serif font-bold text-3xl">{result.pastLifeNumber}</span>
                </div>
                <div className="text-white/25 text-xs mt-2">Angka Karma</div>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">{result.pastLifeMeaning}</p>
            </div>
          </Section>

          {/* ── 5. WETON JAWA & NEPTU ── */}
          <Section number={5} title="Perhitungan Weton Jawa & Neptu" icon={<Star className="w-4 h-4" />} accent="teal">
            <div className="flex items-center justify-between mb-5 gap-4">
              <div>
                <div className="text-white/30 text-xs mb-1">Weton Kelahiran</div>
                <div className="text-[#8dccc5] font-serif font-bold text-2xl">{result.weton}</div>
              </div>
              <div className="text-center bg-[#2d6a5f]/20 border border-[#2d6a5f]/30 rounded-2xl px-7 py-3 flex-shrink-0">
                <div className="text-[#8dccc5]/60 text-xs mb-0.5">Neptu</div>
                <div className="text-[#8dccc5] font-bold text-4xl font-serif">{result.wetonNeptu}</div>
              </div>
            </div>
            <div className="bg-[#2d6a5f]/8 border border-[#2d6a5f]/20 rounded-2xl p-4">
              <p className="text-white/65 text-sm leading-relaxed">{result.wetonMakna}</p>
            </div>
          </Section>

          {/* ── 6. KARIR ── */}
          <Section number={6} title="Karir yang Cocok Sesuai Nama & Energi Diri" icon={<Briefcase className="w-4 h-4" />} accent="gold">
            <p className="text-white/60 text-sm mb-3">
              Berdasarkan sinergi Life Path <span className="text-[#D4AF37] font-semibold">{result.lifePath}</span>, Expression Number <span className="text-[#D4AF37] font-semibold">{result.expressionNumber}</span>, dan Weton <span className="text-[#D4AF37] font-semibold">{result.weton}</span>, jalur karir dan bisnis yang paling selaras dengan energi diri Anda adalah:
            </p>
            <div className="flex flex-wrap gap-2">
              {result.careerPath.split(',').map(c => (
                <span key={c} className="px-3 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#F3E5AB] text-xs font-medium">
                  {c.trim()}
                </span>
              ))}
            </div>
          </Section>

          {/* ── 7. WARNA KEBERUNTUNGAN ── */}
          <Section number={7} title="Warna Keberuntungan" icon={<Palette className="w-4 h-4" />} accent="gold">
            <p className="text-white/50 text-xs mb-4">
              Tiga warna berikut memiliki kecocokan energi tertinggi dengan getaran numerologi dan weton Anda. Gunakan warna-warna ini di pakaian, aksesori, ruang kerja, atau bahkan warna cat dinding untuk meningkatkan frekuensi keberuntungan sehari-hari.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {result.luckyColors.map((color, i) => (
                <div key={color.label} className="rounded-2xl overflow-hidden border border-white/10">
                  <div className="h-16 w-full" style={{ backgroundColor: color.hex }} />
                  <div className="bg-[#0B0C10]/80 p-2.5">
                    <div className="text-[#D4AF37] text-[10px] font-semibold mb-0.5">
                      {i === 0 ? 'Utama' : i === 1 ? 'Pendukung' : 'Aksen'}
                    </div>
                    <div className="text-white text-xs font-semibold leading-tight">{color.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 bg-[#D4AF37]/5 border border-[#D4AF37]/10 rounded-xl p-3">
              <Gem className="w-4 h-4 text-[#D4AF37] flex-shrink-0" />
              <span className="text-white/50 text-xs">Batu keberuntungan yang selaras: <span className="text-[#F3E5AB] font-semibold">{result.luckyGem}</span> — gunakan sebagai perhiasan atau benda hoki di meja kerja Anda.</span>
            </div>
          </Section>

          {/* ── 8. NAMA PANGGILAN HOKI ── */}
          <Section number={8} title="Saran Nama Panggilan Hoki" icon={<Sparkles className="w-4 h-4" />} accent="gold">
            <p className="text-white/50 text-xs mb-4">
              Berikut adalah 2 opsi nama panggilan yang diambil dari energi nama lengkap Anda, dengan kalkulasi angka yang paling seimbang untuk menarik keberuntungan dan kesuksesan finansial:
            </p>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {result.luckyNames.map((name, i) => (
                <div key={name} className="text-center bg-[#0B0C10]/60 rounded-2xl py-5 px-3 border border-[#D4AF37]/15">
                  <div className="text-white/30 text-xs mb-1">Opsi {i + 1}</div>
                  <div className="text-[#D4AF37] font-serif font-bold text-4xl mb-2">{name}</div>
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/15">
                    <span className="text-[#F3E5AB] text-[10px]">Selaras Angka {result.lifePath}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-white/45 text-xs leading-relaxed">
              Gunakan salah satu nama panggilan ini secara konsisten sebagai nama bisnis, username media sosial, atau panggilan sehari-hari untuk memancarkan energi hoki yang terprogram ke alam semesta.
            </p>
          </Section>

          {/* ── 9. TANDA TANGAN HOKI ── */}
          <Section number={9} title="Rekomendasi Tanda Tangan Hoki Berbasis Grafologi" icon={<TrendingUp className="w-4 h-4" />} accent="gold">
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/15 rounded-2xl p-4 mb-5 space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                <p className="text-white/60 text-xs leading-relaxed">
                  <span className="text-[#F3E5AB] font-semibold">Aturan 1 — Nama Panggilan Hoki:</span> Tanda tangan HARUS dibentuk menggunakan nama panggilan hoki <span className="text-[#D4AF37] font-bold">{result.luckyNames[0]}</span> untuk menyelaraskan getaran energi keberuntungan ke dalam identitas profesional Anda.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                <p className="text-white/60 text-xs leading-relaxed">
                  <span className="text-[#F3E5AB] font-semibold">Aturan 2 — Garis Akhir Naik ↗:</span> Pada goresan terakhir di bagian paling kanan, tarik garis lurus tegas yang menanjak ke atas (diagonal ke kanan atas). Garis ini HARUS lurus — tidak boleh melengkung, melungker, atau memutar balik.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                <p className="text-white/60 text-xs leading-relaxed">
                  <span className="text-emerald-300 font-semibold">Makna Grafologi:</span> Goresan nama yang diakhiri garis lurus naik tanpa hambatan melambangkan kesuksesan melesat cepat, mentalitas pemenang, kemakmuran finansial yang terus tumbuh, dan proteksi energi yang kuat.
                </p>
              </div>
            </div>

            <div className="text-center text-white/30 text-xs mb-4">
              Preview tanda tangan hoki dengan nama panggilan <span className="text-[#F3E5AB] font-semibold">{result.luckyNames[0]}</span>:
            </div>
            <div className="bg-[#0B0C10] rounded-2xl p-6 flex items-center justify-center border border-white/5">
              <SignatureCanvas luckyName={result.luckyNames[0]} size="lg" showDownload />
            </div>
            <p className="text-center text-white/25 text-xs mt-3">
              Klik "Download" untuk menyimpan tanda tangan hokimu sebagai file PNG
            </p>
          </Section>

          {/* Closing sentence — mandatory */}
          <div className="bg-gradient-to-r from-[#D4AF37]/10 via-[#D4AF37]/5 to-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-3xl p-7 mb-5 text-center">
            <div className="text-[#D4AF37] text-xs uppercase tracking-widest mb-3">Doa Penutup</div>
            <p className="font-serif text-xl text-[#F3E5AB] font-medium leading-relaxed">
              "Semoga Anda sukses dan selalu diberi keberlimpahan."
            </p>
          </div>

          {/* Email notification */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="text-emerald-300 font-semibold text-sm mb-1">Rekap Laporan Terkirim via Email</div>
                <p className="text-white/50 text-xs leading-relaxed">
                  Laporan analisis lengkap dikirim otomatis ke{' '}
                  <span className="text-white/70 font-medium">{registration.email}</span>.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onSuccess}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#b8920e] text-[#0B0C10] font-bold text-base hover:shadow-lg hover:shadow-[#D4AF37]/30 transition-all duration-300"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  // Payment — bank transfer direct
  return (
    <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
      <style>{`
        @keyframes aff-border-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,175,55,0), 0 0 18px 2px rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.35); }
          50% { box-shadow: 0 0 0 6px rgba(212,175,55,0.12), 0 0 32px 6px rgba(212,175,55,0.22); border-color: rgba(212,175,55,0.8); }
        }
      `}</style>
      <div className="max-w-lg mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </button>

        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Selesaikan Pembayaran</h1>
          <p className="text-white/50 text-sm">Transfer ke rekening BCA berikut untuk mengaktifkan laporan</p>
        </div>

        {/* Order summary */}
        <div className="bg-gradient-to-br from-[#1F2833] to-[#141820] border border-[#D4AF37]/20 rounded-3xl p-6 mb-6">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-4">Ringkasan Pesanan</div>
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <div className="text-white font-medium">Laporan Analisis Metafisika Premium</div>
              <div className="text-white/40 text-xs mt-1 leading-relaxed">
                Arti Nama · Sifat & Karakter · Numerologi Lengkap · Past Life Number · Weton & Neptu · Karir · Warna Hoki · Nama Panggilan Hoki · Tanda Tangan Eksklusif
              </div>
            </div>
            <div className="text-[#D4AF37] font-bold text-lg flex-shrink-0">Rp 100.000</div>
          </div>
          <div className="border-t border-white/10 pt-3 flex justify-between items-center">
            <div className="text-white/50 text-sm">Total Pembayaran</div>
            <div className="text-[#F3E5AB] font-bold text-xl font-serif">
              Rp {PRICE.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Bank transfer — blinking card */}
        <div
          className="rounded-3xl border p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 100%)',
            animation: 'aff-border-pulse 2.5s ease-in-out infinite',
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div>
              <div className="text-[#D4AF37] font-black text-base tracking-wide">Transfer Manual: BCA</div>
              <div className="text-white/40 text-xs">Bayar sekali, laporan aktif selamanya</div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-[#0B0C10]/80 rounded-2xl px-5 py-4 mb-3">
            <div>
              <div className="text-white/40 text-xs mb-1">Nomor Rekening</div>
              <div className="text-[#F3E5AB] font-black text-2xl tracking-widest font-mono">8023036183</div>
            </div>
            <button
              onClick={copyVA}
              className="flex items-center gap-1.5 text-[#D4AF37] text-xs font-semibold hover:text-[#F3E5AB] transition-colors bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 px-3 py-2 rounded-xl"
            >
              <Copy className="w-4 h-4" />
              {copied ? 'Disalin!' : 'Salin'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0B0C10]/50 rounded-xl px-4 py-3">
              <div className="text-white/30 text-xs mb-1">Atas Nama</div>
              <div className="text-[#D4AF37] font-bold text-sm">Heni Setiyowati</div>
            </div>
            <div className="bg-[#0B0C10]/50 rounded-xl px-4 py-3">
              <div className="text-white/30 text-xs mb-1">Jumlah Transfer</div>
              <div className="text-[#D4AF37] font-black text-sm">Rp 100.000</div>
            </div>
          </div>
        </div>

        <button
          onClick={handlePay}
          className="w-full py-4 rounded-2xl text-[#0B0C10] font-black text-base hover:scale-[1.02] transition-transform duration-300 flex items-center justify-center gap-2 overflow-hidden mb-3"
          style={{
            background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 40%, #D4AF37 60%, #b8920e 100%)',
            backgroundSize: '200% auto',
            animation: 'btn-pulse-gold 2s ease-in-out infinite, btn-shimmer 3s linear infinite',
          }}
        >
          <CheckCircle className="w-5 h-5" />
          Konfirmasi — Saya Sudah Transfer Rp 100.000
        </button>

        {/* Repeat bank info below button */}
        <div
          className="rounded-2xl border p-4 mb-4"
          style={{
            background: 'linear-gradient(135deg, #1a1507 0%, #2a1f05 100%)',
            animation: 'aff-border-pulse 2.5s ease-in-out infinite',
          }}
        >
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
            <div>
              <div className="text-[#D4AF37] font-black text-sm tracking-wide">Transfer Manual: BCA</div>
              <div className="text-[#F3E5AB] font-bold text-lg tracking-widest">8023036183</div>
              <div className="text-[#D4AF37]/70 text-xs font-semibold">a.n. Heni Setiyowati · Rp 100.000</div>
            </div>
          </div>
        </div>

        <p className="text-center text-white/25 text-xs">
          Klik konfirmasi setelah transfer berhasil. Laporan langsung aktif.
        </p>
      </div>
    </div>
  );
}
