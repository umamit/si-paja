'use client';

import { useEffect, useState } from 'react';
import { DrainageSegment, MaintenanceLog } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin } from 'lucide-react';
import { getLogs } from '@/services/logs/get-logs';
import { createLog, CreateLogInput } from '@/services/logs/create-log';
import { updateSegment } from '@/services/segments/update-segment';
import { supabase } from '@/lib/supabase/client';
import { CostEstimator } from './cost-estimator';
import { LogList } from './log-list';
import { AddLogDialog } from './add-log-dialog';
import { PhotoComparison } from './photo-comparison';
import { HydrologyAnalysis } from './hydrology-analysis';
import { compressImage } from '@/lib/image-compression';

interface SegmentDetailProps {
  segment: DrainageSegment | null;
  isOpen: boolean;
  onClose: () => void;
}

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export function SegmentDetail({ segment, isOpen, onClose }: SegmentDetailProps) {
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [uploadingAfter, setUploadingAfter] = useState(false);

  useEffect(() => {
    if (isOpen && segment) {
      getLogs(segment.id).then(setLogs).catch(console.error);
    }
  }, [isOpen, segment]);

  if (!segment) return null;

  const handleAddLog = async (input: CreateLogInput) => {
    try {
      const newLog = await createLog(input);
      setLogs((prev) => [newLog, ...prev]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteRepair = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAfter(true);
    try {
      let photoUrl = '';
      if (!isPlaceholder) {
        const compressed = await compressImage(file);
        const filePath = `segments/${Date.now()}-after.jpg`;
        const { error } = await supabase.storage.from('drainage-photos').upload(filePath, compressed);
        if (error) throw error;
        photoUrl = supabase.storage.from('drainage-photos').getPublicUrl(filePath).data.publicUrl;
      } else {
        photoUrl = 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?auto=format&fit=crop&q=80&w=400';
      }

      await updateSegment(segment.id, { condition: 'baik', photo_after_url: photoUrl });
      await handleAddLog({
        segment_id: segment.id,
        action_type: segment.condition === 'tersumbat' ? 'pemeliharaan' : 'perbaikan',
        description: 'Pekerjaan perbaikan selesai. Status dikembalikan ke kondisi Baik.',
        operator_name: 'Staf Lapangan PUPR',
      });
      alert('Pekerjaan pemeliharaan berhasil dilaporkan!');
      window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingAfter(false);
    }
  };

  const conditionColors: Record<string, string> = {
    baik: 'bg-emerald-100 text-emerald-800 border-emerald-250',
    rusak_ringan: 'bg-amber-100 text-amber-800 border-amber-250',
    rusak_berat: 'bg-rose-100 text-rose-800 border-rose-250',
    tersumbat: 'bg-orange-100 text-orange-850 border-orange-250',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border border-slate-100 shadow-xl rounded-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">{segment.name}</DialogTitle>
          <DialogDescription className="text-xs text-slate-400">Detail spesifikasi teknik, analisis hidrologi, & anggaran</DialogDescription>
        </DialogHeader>

        <PhotoComparison segment={segment} uploadingAfter={uploadingAfter} onCompleteRepair={handleCompleteRepair} />

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400">Kondisi Fisik</span>
            <div className="flex"><Badge className={`capitalize border ${conditionColors[segment.condition]}`}>{segment.condition.replace('_', ' ')}</Badge></div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-bold text-slate-400">Material</span>
            <div className="flex"><Badge variant="outline" className="capitalize border-slate-200">{segment.material.replace('_', ' ')}</Badge></div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3 mt-2 grid grid-cols-3 gap-2 text-center bg-slate-50/50 p-2.5 rounded-lg">
          <div><p className="text-[9px] text-slate-400">Panjang (L)</p><p className="text-base font-bold text-slate-900">{segment.length_m} m</p></div>
          <div><p className="text-[9px] text-slate-400">Lebar (B)</p><p className="text-base font-bold text-slate-900">{segment.width_cm} cm</p></div>
          <div><p className="text-[9px] text-slate-400">Tinggi (H)</p><p className="text-base font-bold text-slate-900">{segment.depth_cm} cm</p></div>
        </div>

        <CostEstimator segment={segment} />
        <HydrologyAnalysis segment={segment} />

        <div className="space-y-2 text-xs text-slate-650 border-t pt-3">
          <div className="flex items-start gap-2"><MapPin className="h-4 w-4 text-emerald-600 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-800">Koordinat</p>
              <p className="text-[10px] text-slate-500">Awal: {segment.start_lat}, {segment.start_lng} | Akhir: {segment.end_lat}, {segment.end_lng}</p>
            </div>
          </div>
          <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-emerald-600" />
            <p className="text-[10px] text-slate-500">
              Disurvei: {new Date(segment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Log Pemeliharaan</span>
            <AddLogDialog segmentId={segment.id} onSuccess={handleAddLog} operatorName="Operator PUPR" />
          </div>
          <LogList logs={logs} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default SegmentDetail;
