import { useState } from 'react';
import { ArrowLeft, Play, CheckCircle, Circle, Zap, Brain, Mail, PenLine, Webhook } from 'lucide-react';

interface WebhookLogsProps {
  onBack: () => void;
}

interface LogStep {
  id: string;
  icon: React.FC<{ className?: string }>;
  title: string;
  service: string;
  detail: string;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  duration?: string;
  status: 'idle' | 'running' | 'done' | 'error';
}

const INITIAL_STEPS: LogStep[] = [
  {
    id: 'midtrans',
    icon: Webhook,
    service: 'Midtrans Gateway',
    title: '1. Webhook Pembayaran Diterima',
    detail: 'Midtrans mengirim notifikasi pembayaran sukses ke endpoint webhook aplikasi.',
    payload: {
      order_id: 'NHOKI-' + Date.now(),
      transaction_status: 'settlement',
      payment_type: 'qris',
      gross_amount: '100000.00',
      transaction_time: new Date().toISOString(),
    },
    response: { status: 200, message: 'Webhook received' },
    duration: '89ms',
    status: 'idle',
  },
  {
    id: 'n8n',
    icon: Zap,
    service: 'n8n Workflow Automation',
    title: '2. Workflow n8n Terpicu',
    detail: 'Webhook memicu n8n workflow. Node pertama mengambil data user dari database, lalu meneruskan ke AI API.',
    payload: {
      workflow_id: 'wf_namahoki_001',
      trigger: 'payment_success',
      user_email: 'user@example.com',
      nama_lengkap: 'Budi Santoso',
      tanggal_lahir: '1990-05-15',
    },
    response: {
      workflow_status: 'running',
      nodes_triggered: ['HTTP Request', 'Set Variables', 'AI Analysis', 'WA Gateway'],
    },
    duration: '210ms',
    status: 'idle',
  },
  {
    id: 'ai',
    icon: Brain,
    service: 'Blackbox AI API',
    title: '3. Analisis AI — Weton, Numerologi & Nama Hoki',
    detail: 'n8n mengirim data ke Blackbox AI untuk menghitung weton Jawa, angka kehidupan, kehidupan masa lalu, dan nama hoki yang disarankan.',
    payload: {
      model: 'blackboxai-pro',
      prompt: 'Hitung weton Jawa, life path number, dan saran nama hoki untuk: Budi Santoso, lahir 15 Mei 1990.',
      temperature: 0.3,
    },
    response: {
      weton: 'Rabu Wage',
      neptu: 11,
      life_path_number: 6,
      past_life_number: 9,
      nama_hoki_disarankan: 'Dian',
      vibrasi: 'Harmoni, Kepercayaan, dan Kemakmuran Bisnis',
      tokens_used: 487,
    },
    duration: '1240ms',
    status: 'idle',
  },
  {
    id: 'signature',
    icon: PenLine,
    service: 'Signature Generator Engine',
    title: '4. Generate Tanda Tangan Hoki (HTML5 Canvas)',
    detail: 'Engine frontend/Node.js merender nama hoki menggunakan Dancing Script font pada HTML5 Canvas, lalu menggambar garis hoki ↗ naik ke kanan atas. Diekspor sebagai PNG lossless.',
    payload: {
      nama_hoki: 'Dian',
      font: 'Dancing Script 700',
      canvas_size: '920x320',
      glow_color: '#D4AF37',
      rule: 'ending_stroke_MUST_go_UP_northeast',
      swoosh_bezier_cp: { cp1: [0.18, 0.08], cp2: [0.55, 0.5] },
      export_format: 'image/png',
      dpr_scale: 2,
    },
    response: {
      png_generated: true,
      canvas_api: 'HTML5 CanvasRenderingContext2D',
      font_loaded: 'Dancing Script via document.fonts.load()',
      ending_angle: '+67deg',
      stroke_direction: 'upward_northeast',
      file_url: '/signatures/dian_lp6_hoki.png',
      file_size_kb: 42,
    },
    duration: '340ms',
    status: 'idle',
  },
  {
    id: 'email',
    icon: Mail,
    service: 'Email Service (SMTP / Resend)',
    title: '5. Kirim Rekap Hasil via Email',
    detail: 'n8n memicu email service untuk mengirim laporan lengkap, tanda tangan hoki, dan panduan penggunaan nama hoki ke alamat email user secara otomatis.',
    payload: {
      to: 'user@example.com',
      subject: '✨ Hasil Analisis Nama Hoki & Garis Hoki — Nama Hoki: Dian',
      template: 'namahoki_result',
      variables: {
        nama_hoki: 'Dian',
        angka_hoki: 6,
        weton: 'Rabu Wage',
        signature_url: '/signatures/dian_lp6_hoki.svg',
      },
    },
    response: {
      status: 'delivered',
      message_id: 'email_' + Math.random().toString(36).slice(2, 10),
      delivered_at: new Date().toISOString(),
      open_tracking: true,
    },
    duration: '520ms',
    status: 'idle',
  },
];

const SERVICE_COLORS: Record<string, string> = {
  'Midtrans Gateway': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'n8n Workflow Automation': 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'Blackbox AI API': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Signature Generator Engine': 'text-[#D4AF37] bg-[#D4AF37]/10 border-[#D4AF37]/20',
  'Email Service (SMTP / Resend)': 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
};

export default function WebhookLogs({ onBack }: WebhookLogsProps) {
  const [steps, setSteps] = useState<LogStep[]>(INITIAL_STEPS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function runSimulation() {
    setRunning(true);
    setDone(false);
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'idle' })));

    for (let i = 0; i < INITIAL_STEPS.length; i++) {
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'running' } : s));
      const delay = [900, 1200, 1800, 900, 1100][i];
      await new Promise(r => setTimeout(r, delay));
      setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, status: 'done' } : s));
      setExpanded(INITIAL_STEPS[i].id);
    }

    setRunning(false);
    setDone(true);
  }

  function reset() {
    setSteps(INITIAL_STEPS.map(s => ({ ...s, status: 'idle' })));
    setDone(false);
    setExpanded(null);
  }

  const totalTime = INITIAL_STEPS.reduce((a, s) => {
    const ms = parseInt(s.duration || '0');
    return a + ms;
  }, 0);

  return (
    <div className="min-h-screen bg-[#0B0C10] text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-white/40 hover:text-white/70 mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-orange-400/15 flex items-center justify-center">
              <Zap className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-orange-400 text-xs uppercase tracking-widest font-semibold">Developer View</div>
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Automation Webhook Logs</h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Simulasi alur otomasi lengkap ketika user berhasil melakukan pembayaran:
            Midtrans → n8n → Blackbox AI → Signature Generator → WhatsApp Gateway.
          </p>
        </div>

        {/* Architecture diagram */}
        <div className="bg-[#1F2833]/60 border border-white/8 rounded-3xl p-6 mb-8">
          <div className="text-white/40 text-xs uppercase tracking-wider mb-4">Arsitektur Sistem</div>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {['Midtrans', 'n8n', 'Blackbox AI', 'Signature', 'Email Service'].map((node, i) => (
              <div key={node} className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-[#0B0C10] border border-white/15 rounded-lg text-white/70 text-xs font-mono">{node}</div>
                {i < 4 && <div className="text-[#D4AF37]/50 text-xs">→</div>}
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { label: 'Runtime', val: 'Node.js / Deno' },
              { label: 'Workflow', val: 'n8n Self-hosted' },
              { label: 'AI Model', val: 'Blackbox AI Pro' },
              { label: 'Pengiriman', val: 'Email (Resend)' },
            ].map(i => (
              <div key={i.label} className="text-center">
                <div className="text-white/30">{i.label}</div>
                <div className="text-white/60 font-mono">{i.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={runSimulation}
            disabled={running}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm disabled:opacity-50 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300"
          >
            {running ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Menjalankan...</>
            ) : (
              <><Play className="w-4 h-4" /> Jalankan Simulasi</>
            )}
          </button>
          {done && (
            <button onClick={reset} className="px-4 py-3 rounded-xl border border-white/15 text-white/50 hover:text-white/80 hover:border-white/30 text-sm transition-colors">
              Reset
            </button>
          )}
          {done && (
            <div className="flex items-center gap-2 text-emerald-400 text-sm">
              <CheckCircle className="w-4 h-4" />
              Selesai dalam ~{(totalTime / 1000).toFixed(1)}s
            </div>
          )}
        </div>

        {/* Log steps */}
        <div className="space-y-3">
          {steps.map(step => {
            const colorClass = SERVICE_COLORS[step.service] || 'text-white/60 bg-white/5 border-white/15';
            const isExpanded = expanded === step.id;
            return (
              <div
                key={step.id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  step.status === 'running' ? 'border-amber-400/40 bg-amber-400/5 shadow-lg shadow-amber-400/10' :
                  step.status === 'done' ? 'border-emerald-500/25 bg-emerald-500/3' :
                  'border-white/8 bg-[#1F2833]/40'
                }`}
              >
                <button
                  className="w-full flex items-center gap-4 p-5 text-left"
                  onClick={() => setExpanded(isExpanded ? null : step.id)}
                >
                  {/* Status icon */}
                  <div className="flex-shrink-0">
                    {step.status === 'idle' && <Circle className="w-5 h-5 text-white/20" />}
                    {step.status === 'running' && <div className="w-5 h-5 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />}
                    {step.status === 'done' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                  </div>

                  {/* Service badge */}
                  <div className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold flex-shrink-0 ${colorClass}`}>
                    <step.icon className="w-3.5 h-3.5" />
                    <span>{step.service}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-white font-semibold text-sm">{step.title}</div>
                    <div className="text-white/40 text-xs mt-0.5 truncate">{step.detail}</div>
                  </div>

                  {step.status === 'done' && (
                    <div className="text-emerald-400/60 text-xs flex-shrink-0">{step.duration}</div>
                  )}
                </button>

                {/* Expanded payload/response */}
                {isExpanded && step.status === 'done' && (
                  <div className="px-5 pb-5 grid md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Request Payload</div>
                      <pre className="bg-[#0B0C10] border border-white/8 rounded-xl p-4 text-xs text-emerald-300/80 overflow-auto max-h-48 font-mono leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(step.payload, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-white/30 text-xs uppercase tracking-wider mb-2">Response</div>
                      <pre className="bg-[#0B0C10] border border-white/8 rounded-xl p-4 text-xs text-sky-300/80 overflow-auto max-h-48 font-mono leading-relaxed whitespace-pre-wrap">
                        {JSON.stringify(step.response, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {done && (
          <div className="mt-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 text-center">
            <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-white mb-2">Simulasi Selesai!</h3>
            <p className="text-white/50 text-sm">
              Seluruh pipeline berjalan sukses. Dalam produksi nyata, hasil dikirim otomatis ke WhatsApp user dalam hitungan detik setelah pembayaran dikonfirmasi.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
