import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Registration {
  id?: string;
  nama_lengkap: string;
  tanggal_lahir: string;
  weton?: string;
  angka_hoki?: number;
  nama_hoki?: string;
  email: string;
  nomer_hp: string;
  status_pembayaran?: string;
  affiliator_id?: string | null;
  created_at?: string;
}

export interface Affiliator {
  id?: string;
  nama_affiliator: string;
  email: string;
  nomer_hp: string;
  alamat?: string;
  no_rekening?: string;
  kode_referral?: string;
  total_klik?: number;
  total_konversi?: number;
  total_komisi?: number;
  status_akun?: string;
  created_at?: string;
}
