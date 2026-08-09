'use client';

import { DrainageSegment } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Tag, ShieldCheck, MapPin } from 'lucide-react';

interface SegmentDetailProps {
  segment: DrainageSegment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function SegmentDetail({ segment, isOpen, onClose }: SegmentDetailProps) {
  if (!segment) return null;

  const conditionColors: Record<string, string> = {
    baik: 'bg-emerald-100 text-emerald-800 border-emerald-250',
    rusak_ringan: 'bg-amber-100 text-amber-800 border-amber-250',
    rusak_berat: 'bg-rose-100 text-rose-800 border-rose-250',
    tersumbat: 'bg-orange-100 text-orange-800 border-orange-250',
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-white border border-slate-100 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 leading-tight">
            {segment.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Detail spesifikasi teknik dan koordinat drainase
          </DialogDescription>
        </DialogHeader>

        {segment.photo_url && (
          <div className="w-full h-48 overflow-hidden rounded-lg border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={segment.photo_url}
              alt={segment.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Kondisi Fisik</span>
            <div className="flex">
              <Badge className={`capitalize border ${conditionColors[segment.condition]}`}>
                {segment.condition.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tipe Material</span>
            <div className="flex">
              <Badge variant="outline" className="capitalize border-slate-200">
                {segment.material.replace('_', ' ')}
              </Badge>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 mt-2 grid grid-cols-3 gap-2 text-center bg-slate-50/50 p-3 rounded-lg">
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Panjang</p>
            <p className="text-lg font-bold text-slate-900">{segment.length_m} m</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Lebar</p>
            <p className="text-lg font-bold text-slate-900">{segment.width_cm} cm</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-medium">Kedalaman</p>
            <p className="text-lg font-bold text-slate-900">{segment.depth_cm} cm</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs text-slate-600 pt-2">
          <div className="flex items-start gap-2.5">
            <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Koordinat Jalur</p>
              <p className="text-[11px] text-slate-500">Awal: {segment.start_lat}, {segment.start_lng}</p>
              <p className="text-[11px] text-slate-500">Akhir: {segment.end_lat}, {segment.end_lng}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Calendar className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <p className="font-semibold text-slate-850">Tanggal Survei</p>
              <p className="text-[11px] text-slate-500">
                {new Date(segment.created_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
          {segment.description && (
            <div className="border-t border-slate-100 pt-3">
              <p className="font-semibold text-slate-800">Keterangan Tambahan</p>
              <p className="text-[11px] text-slate-500 mt-1">{segment.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
export default SegmentDetail;
