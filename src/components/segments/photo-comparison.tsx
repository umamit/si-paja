'use client';

import { DrainageSegment } from '@/types';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface PhotoComparisonProps {
  segment: DrainageSegment;
  uploadingAfter: boolean;
  onCompleteRepair: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export function PhotoComparison({ segment, uploadingAfter, onCompleteRepair }: PhotoComparisonProps) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-1">
      {segment.photo_url && (
        <div className="space-y-1">
          <span className="text-[9px] font-bold text-slate-400">SEBELUM (BEFORE)</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={segment.photo_url} alt="Before" className="w-full h-28 object-cover rounded-lg border border-slate-100" />
        </div>
      )}
      <div className="space-y-1">
        <span className="text-[9px] font-bold text-slate-400">SESUDAH (AFTER)</span>
        {segment.photo_after_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={segment.photo_after_url} alt="After" className="w-full h-28 object-cover rounded-lg border border-slate-100" />
        ) : (
          <div className="relative flex flex-col justify-center items-center h-28 border border-dashed rounded-lg bg-slate-50 text-slate-400 text-center p-2">
            {uploadingAfter ? (
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            ) : (
              <>
                <span className="text-[10px] mb-1">Belum diperbaiki</span>
                {segment.condition !== 'baik' && (
                  <label className="text-[9px] bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded cursor-pointer transition flex items-center gap-1 font-semibold">
                    <CheckCircle2 className="h-3 w-3" />Selesaikan
                    <input type="file" accept="image/*" onChange={onCompleteRepair} className="hidden" />
                  </label>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default PhotoComparison;
