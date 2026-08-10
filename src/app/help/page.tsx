'use client';

import { AppLayout } from '@/components/shared/layout';
import { Card } from '@/components/ui/card';
import { BookOpen, FileUp, HelpCircle, RefreshCw, Settings } from 'lucide-react';

export default function HelpPage() {
  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto pb-12">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Panduan Penggunaan SI-PAJA</h2>
          <p className="text-sm text-slate-500">Petunjuk teknis pengoperasian pemetaan drainase untuk surveyor Dinas PUPR Pulau Taliabu.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Guide Card 1 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-[#003366]/10 text-[#003366]"><FileUp className="h-5 w-5" /></div>
              <h3>Ekspor & Impor GPX (GPS Garmin)</h3>
            </div>
            <ol className="list-decimal pl-4 text-xs text-slate-655 space-y-2 leading-relaxed">
              <li>Lakukan tracking jalur drainase menggunakan perangkat GPS Handheld Garmin di lapangan.</li>
              <li>Hubungkan perangkat Garmin ke komputer menggunakan kabel USB.</li>
              <li>Salin file log perjalanan berformat <strong>.gpx</strong> dari memori penyimpanan perangkat.</li>
              <li>Buka halaman <strong>Segmen Drainase</strong> di aplikasi ini, klik <strong>Tambah Segmen</strong>, pilih tab <strong>Impor GPX</strong>, dan unggah file tersebut.</li>
            </ol>
          </Card>

          {/* Guide Card 2 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-[#ffcc00]/20 text-amber-700"><BookOpen className="h-5 w-5" /></div>
              <h3>Membuat File KML (Google Earth)</h3>
            </div>
            <ol className="list-decimal pl-4 text-xs text-slate-655 space-y-2 leading-relaxed">
              <li>Buka aplikasi <strong>Google Earth Pro</strong> di komputer.</li>
              <li>Gunakan alat <i>Add Path</i> (Tambahkan Jalur) untuk menggambar jalur rencana drainase baru.</li>
              <li>Klik kanan pada jalur yang digambar di panel samping, pilih <strong>Save Place As...</strong> (Simpan Tempat Sebagai).</li>
              <li>Pilih format penyimpanan <strong>Kml (.kml)</strong> (bukan .kmz).</li>
              <li>Unggah file KML tersebut ke sistem untuk pemetaan rencana saluran baru.</li>
            </ol>
          </Card>

          {/* Guide Card 3 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700"><RefreshCw className="h-5 w-5" /></div>
              <h3>Status Database & Mode Offline</h3>
            </div>
            <div className="text-xs text-slate-655 space-y-2 leading-relaxed">
              <p>Aplikasi SI-PAJA dilengkapi dengan dual-engine database untuk kelancaran kerja dinas:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong>Mode Cloud (Supabase Connected)</strong>: Data tersinkronisasi ke server pusat cloud. Semua surveyor melihat data yang sama.</li>
                <li><strong>Mode Offline (Local Browser)</strong>: Aktif jika kunci server Supabase belum dikonfigurasi. Data disimpan aman di memori browser lokal Anda.</li>
              </ul>
            </div>
          </Card>

          {/* Guide Card 4 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700"><HelpCircle className="h-5 w-5" /></div>
              <h3>Analisis Hidrologi Limpasan</h3>
            </div>
            <div className="text-xs text-slate-655 space-y-2 leading-relaxed">
              <p>Perhitungan debit banjir rencana menggunakan <strong>Metode Rasional ($Q = 0.278 \cdot C \cdot I \cdot A$)</strong>:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong>Q rencana (Qr)</strong>: Beban volume limpasan air hujan ekstrim yang akan melewati saluran.</li>
                <li><strong>Q max</strong>: Batas tampung hidrolik aktual saluran berdasarkan material dan dimensi.</li>
                <li>Jika <strong>Qr &gt; Q max</strong>, sistem akan menandai saluran berisiko luapan banjir.</li>
              </ul>
            </div>
          </Card>
          {/* Guide Card 5 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-700"><BookOpen className="h-5 w-5" /></div>
              <h3>Perencanaan Saluran & Rekayasa Dimensi</h3>
            </div>
            <div className="text-xs text-slate-650 space-y-2 leading-relaxed">
              <p>Prosedur evaluasi & pengusulan dimensi penampang saluran baru:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong>Identifikasi Masalah</strong>: Jika parit eksisting berstatus <strong>🔴 Rawan Meluap</strong>, catat sisa kapasitas penampangnya.</li>
                <li><strong>Simulasi Dimensi Rencana</strong>: Buka form pendaftaran, pilih mode <strong>Perbarui</strong>, pilih saluran, lalu ubah kategori menjadi <strong>Rencana (Proposed)</strong>.</li>
                <li><strong>Modifikasi Penampang</strong>: Naikkan nilai Lebar (B) atau Tinggi (H) secara bertahap pada form, lalu klik simpan.</li>
                <li><strong>Verifikasi Struktur</strong>: Pastikan indikator berubah menjadi <strong>🟢 Kapasitas Aman</strong> (tinggi jagaan &gt; 10 cm) pada sketsa dinamis sebelum diajukan ke anggaran RAB Masterplan APBD.</li>
              </ul>
            </div>
          </Card>
          {/* Guide Card 6 */}
          <Card className="p-6 bg-white shadow-sm border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-slate-900 font-bold">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700"><Settings className="h-5 w-5" /></div>
              <h3>Pengaturan Tarif & Standar Harga Satuan (SHS)</h3>
            </div>
            <div className="text-xs text-slate-655 space-y-2 leading-relaxed">
              <p>Mekanisme pembaruan harga satuan dinamis untuk kalkulator anggaran:</p>
              <ul className="list-disc pl-4 space-y-1.5">
                <li><strong>Akses Pengaturan</strong>: Buka menu <strong>Pengaturan</strong> di sidebar untuk melihat tarif pembangunan aktif.</li>
                <li><strong>Sesuaikan Nilai</strong>: Ganti nominal rupiah sesuai SK penetapan Bupati/Kepala Dinas Taliabu yang terbaru.</li>
                <li><strong>Pembaruan Otomatis</strong>: Klik simpan. Tarif baru akan otomatis langsung diterapkan di panel detail estimasi saluran serta halaman cetak laporan keuangan.</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
