'use client';

import { useState } from 'react';
import { useGpxParser } from '@/hooks/use-gpx-parser';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { CreateSegmentInput } from '@/services/segments/create-segment';
import { FileUp, FileCheck, AlertCircle } from 'lucide-react';

interface GpxImporterProps {
  onSuccess: (input: CreateSegmentInput) => void;
  surveyorId?: string;
}

export function GpxImporter({ onSuccess, surveyorId }: GpxImporterProps) {
  const { parseGpx, parsing, error: parseError } = useGpxParser();
  const [parsedData, setParsedData] = useState<any | null>(null);
  const [material, setMaterial] = useState<'pasangan_batu' | 'beton_precast' | 'tanah' | 'belum_ada' | 'lainnya'>('pasangan_batu');
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'tersumbat'>('baik');
  const [widthCm, setWidthCm] = useState('50');
  const [depthCm, setDepthCm] = useState('50');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseGpx(file);
      setParsedData(data);
    } catch (err) {
      console.error('Failed to parse GPX', err);
    }
  };

  const handleImport = () => {
    if (!parsedData) return;
    onSuccess({
      name: parsedData.name,
      material,
      condition,
      length_m: parsedData.lengthM,
      width_cm: parseFloat(widthCm),
      depth_cm: parseFloat(depthCm),
      start_lat: parsedData.startLat,
      start_lng: parsedData.startLng,
      end_lat: parsedData.endLat,
      end_lng: parsedData.endLng,
      gps_source: 'file_import',
      surveyor_id: surveyorId,
    });
    setParsedData(null);
  };

  return (
    <div className="space-y-4 max-w-lg bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors relative">
        <input type="file" accept=".gpx,.kml" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" disabled={parsing} />
        {parsedData ? (
          <>
            <FileCheck className="h-10 w-10 text-emerald-500 mb-2" />
            <p className="text-sm font-semibold text-slate-800">{parsedData.name}</p>
            <p className="text-xs text-slate-400 mt-1">Panjang jalur GPS: {parsedData.lengthM} meter</p>
          </>
        ) : (
          <>
            <FileUp className="h-10 w-10 text-slate-400 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Pilih file GPS / Google Earth (.gpx, .kml)</p>
            <p className="text-xs text-slate-400 mt-1">Klik untuk cari atau seret file ke sini</p>
          </>
        )}
      </div>

      {parseError && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 text-rose-700 rounded-lg text-xs">
          <AlertCircle className="h-4 w-4" /><span>{parseError}</span>
        </div>
      )}

      {parsedData && (
        <div className="space-y-4 pt-2 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Material</label>
              <Select value={material} onValueChange={(val: any) => setMaterial(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pasangan_batu">Batu Kali</SelectItem>
                  <SelectItem value="beton_precast">Beton Precast</SelectItem>
                  <SelectItem value="tanah">Tanah</SelectItem>
                  <SelectItem value="belum_ada">Belum Ada Drainase</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kondisi</label>
              <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="baik">Baik</SelectItem>
                  <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
                  <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
                  <SelectItem value="tersumbat">Tersumbat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Lebar Drainase (cm)</label>
              <Input type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} required />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">Kedalaman (cm)</label>
              <Input type="number" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} required />
            </div>
          </div>

          <Button type="button" onClick={handleImport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
            Impor Segmen Koordinat
          </Button>
        </div>
      )}
    </div>
  );
}
export default GpxImporter;
