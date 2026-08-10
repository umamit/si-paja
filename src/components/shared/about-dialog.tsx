'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Info, ShieldCheck } from 'lucide-react';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const steps = [
    { num: '1', title: 'Data Curah Hujan Historis', desc: 'Pengumpulan data hujan harian maksimum (10-20 tahun) stasiun Pulau Taliabu.' },
    { num: '2', title: 'Uji Konsistensi Data', desc: 'Validasi data historis menggunakan metode RAPS atau Double Mass Curve.' },
    { num: '3', title: 'Analisis Frekuensi Hujan', desc: 'Proyeksi curah hujan rencana kala ulang (Log Pearson III / Gumbel).' },
    { num: '4', title: 'Intensitas Hujan Rencana (I)', desc: 'Penurunan intensitas hujan rencana dengan rumus Mononobe / Kurva IDF.' },
    { num: '5', title: 'Analisis Hidrolika SI-PAJA', desc: 'Perhitungan debit limpasan Metode Rasional (Q = 0,278 × C × I × A).' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto bg-slate-900 border border-slate-800 text-slate-100 p-5 rounded-xl shadow-2xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base font-black tracking-wide flex items-center gap-2 text-white">
            <Info className="h-5 w-5 text-amber-400 shrink-0" />
            TENTANG SI-PAJA
          </DialogTitle>
          <DialogDescription className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Sistem Informasi Pemetaan & Analisis Jaringan Air (SI-PAJA) Kabupaten Pulau Taliabu
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          {/* Deskripsi PUPR */}
          <div className="p-3 bg-slate-950/40 rounded-lg border border-slate-800 space-y-1.5 leading-relaxed text-slate-300">
            <p>
              Aplikasi ini dikembangkan untuk memetakan kondisi fisik saluran drainase eksisting, mengidentifikasi penyumbatan/kerusakan, 
              dan melakukan simulasi dimensi penampang basah rencana secara ilmiah.
            </p>
            <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wide border-t border-slate-800/80 pt-1.5">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              Dinas Pekerjaan Umum dan Penataan Ruang (PUPR) Taliabu
            </div>
          </div>

          {/* Alur Hidrologi */}
          <div className="space-y-2">
            <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Alur Analisis Perencanaan Hidrologi (SNI)</p>
            <div className="flex flex-col gap-1.5 bg-slate-950/20 p-3 rounded-lg border border-slate-800/60">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex flex-col">
                  <div className="flex items-start gap-2.5">
                    <span className="h-5 w-5 flex items-center justify-center rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold text-[10px] shrink-0 mt-0.5">
                      {step.num}
                    </span>
                    <div>
                      <p className="font-bold text-slate-200 text-[11px] leading-tight">{step.title}</p>
                      <p className="text-[9.5px] text-slate-400 leading-normal mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="h-3 border-l-2 border-dashed border-slate-800 ml-2.5 my-0.5"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rujukan SNI */}
          <div className="p-2.5 bg-amber-950/20 border border-amber-900/30 rounded-lg text-[9.5px] text-amber-300/90 leading-normal">
            <strong>Rujukan Standar Nasional Indonesia:</strong> SNI 2415:2016 (Tata Cara Perhitungan Debit Banjir Rencana) & SNI 03-3424-1994 (Tata Cara Perencanaan Drainase Permukaan Jalan).
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
