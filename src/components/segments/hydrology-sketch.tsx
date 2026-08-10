'use client';

interface HydrologySketchProps {
  width_cm: number;
  depth_cm: number;
  water_height_m: number;
  freeboard_m: number;
  label: string;
}

export function HydrologySketch({
  width_cm,
  depth_cm,
  water_height_m,
  freeboard_m,
  label,
}: HydrologySketchProps) {
  const B = width_cm / 100;
  const H = depth_cm / 100;
  const waterPercent = H > 0 ? Math.min((water_height_m / H) * 100, 100) : 0;
  const isOverflow = water_height_m > H;

  return (
    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-lg border border-slate-100 mt-2 text-slate-800 w-full">
      <p className="text-[9px] uppercase font-bold text-slate-400 mb-2 tracking-wider">{label}</p>
      
      <div className="relative w-40 h-24 border-b-4 border-x-4 border-slate-600 bg-slate-100/50 flex items-end overflow-hidden rounded-b-md">
        {/* Air Penampang Basah */}
        <div
          className={`w-full transition-all duration-500 flex items-center justify-center text-[9px] font-extrabold border-t-2 ${
            isOverflow
              ? 'bg-rose-500/40 border-rose-500 text-rose-900 animate-pulse'
              : 'bg-blue-500/35 border-blue-500 text-blue-900'
          }`}
          style={{ height: `${waterPercent}%` }}
        >
          {water_height_m > 0 && `h: ${water_height_m.toFixed(2)}m`}
        </div>

        {/* Label H (Kedalaman Fisik) */}
        <div className="absolute left-1.5 top-1.5 text-[8.5px] text-slate-400 font-bold bg-white/70 px-0.5 rounded">
          H: {H.toFixed(2)}m
        </div>

        {/* Label Tinggi Jagaan (Freeboard) */}
        <div
          className={`absolute right-1.5 top-1.5 text-[8.5px] font-bold px-1.5 py-0.25 rounded border ${
            isOverflow || freeboard_m <= 0.1
              ? 'bg-rose-50 border-rose-200 text-rose-700 font-extrabold animate-bounce'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {isOverflow ? 'Luap!' : `Jagaan: ${freeboard_m.toFixed(2)}m`}
        </div>
      </div>

      {/* Label B (Lebar Fisik) */}
      <div className="w-40 text-center text-[9px] text-slate-500 font-bold mt-1.5">
        Lebar (B): {B.toFixed(2)}m ({width_cm} cm)
      </div>
    </div>
  );
}
export default HydrologySketch;
