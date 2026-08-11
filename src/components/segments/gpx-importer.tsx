'use client';

import { useState } from 'react';
import { useGpxParser } from '@/hooks/use-gpx-parser';
import { CreateSegmentInput } from '@/services/segments/create-segment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUp, FileCheck, AlertCircle, Loader2 } from 'lucide-react';
import { DrainageSegment } from '@/types';

interface GpxImporterProps { onSuccess: (input: CreateSegmentInput, updateId?: string) => void; surveyorId?: string; segments?: DrainageSegment[]; }

export function GpxImporter({ onSuccess, surveyorId, segments = [] }: GpxImporterProps) {
  const { parseGpx, parsing, error: parseError } = useGpxParser();
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [selectedId, setSelectedId] = useState('');
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [category, setCategory] = useState<'existing' | 'proposed'>('existing');
  const [material, setMaterial] = useState<'pasangan_batu' | 'beton_precast' | 'tanah' | 'belum_ada' | 'lainnya'>('pasangan_batu');
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'tersumbat'>('baik');
  const [widthCm, setWidthCm] = useState('50');
  const [depthCm, setDepthCm] = useState('50');

  const handleSelectSegment = (id: any) => {
    if (!id) return;
    const s = segments.find(x => x.id === id);
    if (!s) return;
    setSelectedId(id);
    setCategory(s.category || 'existing');
    setMaterial(s.material);
    setCondition(s.condition);
    setWidthCm(String(s.width_cm));
    setDepthCm(String(s.depth_cm));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseGpx(file).then(setParsedData).catch(console.error);
  };

  const handleImport = () => {
    if (!parsedData) return;
    onSuccess({
      name: parsedData.name, material, condition, category,
      length_m: parsedData.lengthM, width_cm: parseFloat(widthCm), depth_cm: parseFloat(depthCm),
      start_lat: parsedData.startLat, start_lng: parsedData.startLng, end_lat: parsedData.endLat, end_lng: parsedData.endLng,
      gps_source: 'file_import', surveyor_id: surveyorId,
      path_coordinates: parsedData.pathCoordinates,
      start_elevation_m: parsedData.startElevationM || 0,
      end_elevation_m: parsedData.endElevationM || 0,
    }, mode === 'update' ? selectedId : undefined);
    setParsedData(null);
  };

  return (
    <div className="space-y-4 max-w-lg bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-slate-800 text-xs">
      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-150">
        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase">Mode Impor</label>
          <Select value={mode} onValueChange={(val: any) => { setMode(val); setSelectedId(''); setParsedData(null); setCategory('existing'); setMaterial('pasangan_batu'); setCondition('baik'); setWidthCm('50'); setDepthCm('50'); }}>
            <SelectTrigger className="w-full text-xs h-8 bg-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="create">Baru</SelectItem><SelectItem value="update">Perbarui</SelectItem></SelectContent>
          </Select>
        </div>
        {mode === 'update' && (
          <div>
            <label className="text-[9px] font-bold text-slate-500 uppercase">Pilih Saluran</label>
            <Select value={selectedId} onValueChange={handleSelectSegment}>
              <SelectTrigger className="w-full text-xs h-8 bg-white"><SelectValue placeholder="Pilih..." /></SelectTrigger>
              <SelectContent>{segments.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 relative">
        <input type="file" accept=".gpx,.kml" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={parsing} />
        {parsedData ? (
          <><FileCheck className="h-10 w-10 text-emerald-500 mb-2" /><p className="text-sm font-semibold text-slate-805">{parsedData.name}</p><p className="text-xs text-slate-400 mt-1">Jalur: {parsedData.lengthM} m</p></>
        ) : (
          <><FileUp className="h-10 w-10 text-slate-400 mb-2" /><p className="text-sm font-semibold text-slate-700">Pilih file GPS / Google Earth (.gpx, .kml)</p><p className="text-xs text-slate-400 mt-1">Klik untuk cari atau seret file ke sini</p></>
        )}
      </div>

      {parseError && <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs"><AlertCircle className="h-4 w-4" /><span>{parseError}</span></div>}

      {parsedData && (
        <div className="space-y-4 pt-2 border-t">
          <div className="grid grid-cols-3 gap-3">
            {([
              { key: 'category', label: 'Kategori', val: category, set: setCategory, opt: [{v:'existing',l:'Eksisting'}, {v:'proposed',l:'Rencana'}] },
              { key: 'material', label: 'Material', val: material, set: setMaterial, opt: [{v:'pasangan_batu',l:'Batu Kali'}, {v:'beton_precast',l:'Precast'}, {v:'tanah',l:'Tanah'}, {v:'belum_ada',l:'Belum Ada'}, {v:'lainnya',l:'Lainnya'}] },
              { key: 'condition', label: 'Kondisi', val: condition, set: setCondition, opt: [{v:'baik',l:'Baik'}, {v:'rusak_ringan',l:'R. Ringan'}, {v:'rusak_berat',l:'R. Berat'}, {v:'tersumbat',l:'Tersumbat'}] }
            ] as const).map((sel) => (
              <div key={sel.key}>
                <label className="text-[9px] font-bold text-slate-500 uppercase pl-0.5">{sel.label}</label>
                <Select value={sel.val} onValueChange={(val: any) => sel.set(val)}>
                  <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{sel.opt.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase pl-0.5">Lebar (B) (cm)</label>
              <Input type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className="text-xs h-9 bg-slate-50/50" required />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-500 uppercase pl-0.5">Tinggi (H) (cm)</label>
              <Input type="number" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} className="text-xs h-9 bg-slate-50/50" required />
            </div>
          </div>

          <Button onClick={handleImport} className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-9 text-xs rounded-xl shadow-md transition-all duration-200">
            {mode === 'update' ? 'Simpan Pembaruan Segmen' : 'Simpan Segmen Baru'}
          </Button>
        </div>
      )}
      
      <div className="flex flex-col gap-1.5 text-[9px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
        <div className="flex items-center justify-between">
          <span className="font-medium">Berkas Contoh:</span>
          <div className="flex gap-2.5 font-bold">
            <a href="/samples/segmen1.kml" download className="text-[#003366] hover:underline">Segmen 1 (.kml)</a>
            <span className="text-slate-300">&bull;</span>
            <a href="/samples/sungai.kml" download className="text-[#003366] hover:underline">Sungai (.kml)</a>
            <span className="text-slate-300">&bull;</span>
            <a href="/samples/sample.gpx" download className="text-[#003366] hover:underline">Sample GPX</a>
            <span className="text-slate-300">&bull;</span>
            <a href="/samples/sample.kml" download className="text-[#003366] hover:underline">Sample KML</a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default GpxImporter;
