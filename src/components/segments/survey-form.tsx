'use client';

import { useState } from 'react';
import { CreateSegmentInput } from '@/services/segments/create-segment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { Loader2, Navigation, FileImage } from 'lucide-react';

interface SurveyFormProps {
  onSuccess: (input: CreateSegmentInput) => void;
  surveyorId?: string;
}

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export function SurveyForm({ onSuccess, surveyorId }: SurveyFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'existing' | 'proposed'>('existing');
  const [material, setMaterial] = useState<'pasangan_batu' | 'beton_precast' | 'tanah' | 'belum_ada' | 'lainnya'>('pasangan_batu');
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'tersumbat'>('baik');
  const [lengthM, setLengthM] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [depthCm, setDepthCm] = useState('');
  const [coords, setCoords] = useState({ startLat: '', startLng: '', endLat: '', endLng: '' });
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);

  const getDeviceLocation = (type: 'start' | 'end') => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setCoords((prev) => ({
        ...prev,
        [type === 'start' ? 'startLat' : 'endLat']: pos.coords.latitude.toFixed(6),
        [type === 'start' ? 'startLng' : 'endLng']: pos.coords.longitude.toFixed(6),
      }));
    });
  };

  const handlePhotoUpload = async (file: File): Promise<string | null> => {
    if (isPlaceholder) return URL.createObjectURL(file);
    const fileExt = file.name.split('.').pop();
    const filePath = `segments/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from('drainage-photos').upload(filePath, file);
    if (error) throw error;
    return supabase.storage.from('drainage-photos').getPublicUrl(filePath).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      let photoUrl = '';
      if (fileInput?.files && fileInput.files[0]) {
        photoUrl = (await handlePhotoUpload(fileInput.files[0])) || '';
      }
      onSuccess({
        name,
        material,
        condition,
        category,
        length_m: parseFloat(lengthM),
        width_cm: parseFloat(widthCm),
        depth_cm: parseFloat(depthCm),
        start_lat: parseFloat(coords.startLat),
        start_lng: parseFloat(coords.startLng),
        end_lat: parseFloat(coords.endLat),
        end_lng: parseFloat(coords.endLng),
        photo_url: photoUrl || undefined,
        gps_source: 'device_gps',
        surveyor_id: surveyorId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-slate-800">
      <Input placeholder="Nama Segmen (contoh: Jl. Gajah Mada Segmen A)" value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-10" required />
      
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Kategori</label>
          <Select value={category} onValueChange={(val: any) => setCategory(val)}>
            <SelectTrigger className="w-full text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="existing">Eksisting</SelectItem><SelectItem value="proposed">Rencana</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Material</label>
          <Select value={material} onValueChange={(val: any) => setMaterial(val)}>
            <SelectTrigger className="w-full text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pasangan_batu">Batu Kali</SelectItem><SelectItem value="beton_precast">Precast</SelectItem>
              <SelectItem value="tanah">Tanah</SelectItem><SelectItem value="belum_ada">Belum Ada</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Kondisi</label>
          <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
            <SelectTrigger className="w-full text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baik">Baik</SelectItem><SelectItem value="rusak_ringan">R. Ringan</SelectItem>
              <SelectItem value="rusak_berat">R. Berat</SelectItem><SelectItem value="tersumbat">Tersumbat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Panjang (m)</label>
          <Input type="number" step="any" value={lengthM} onChange={(e) => setLengthM(e.target.value)} className="text-xs h-9" required />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Lebar (cm)</label>
          <Input type="number" step="any" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} className="text-xs h-9" required />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Dalam (cm)</label>
          <Input type="number" step="any" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} className="text-xs h-9" required />
        </div>
      </div>

      <div className="space-y-2.5 border border-slate-150 p-3.5 rounded-xl bg-slate-50/50">
        <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Koordinat Start</span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider" onClick={() => getDeviceLocation('start')}><Navigation className="h-3 w-3 mr-1" />Ambil GPS</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Start Lat" type="number" step="any" value={coords.startLat} onChange={(e) => setCoords({...coords, startLat: e.target.value})} className="text-xs h-9 bg-white" required />
          <Input placeholder="Start Lng" type="number" step="any" value={coords.startLng} onChange={(e) => setCoords({...coords, startLng: e.target.value})} className="text-xs h-9 bg-white" required />
        </div>
      </div>

      <div className="space-y-2.5 border border-slate-150 p-3.5 rounded-xl bg-slate-50/50">
        <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">Koordinat End</span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider" onClick={() => getDeviceLocation('end')}><Navigation className="h-3 w-3 mr-1" />Ambil GPS</Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="End Lat" type="number" step="any" value={coords.endLat} onChange={(e) => setCoords({...coords, endLat: e.target.value})} className="text-xs h-9 bg-white" required />
          <Input placeholder="End Lng" type="number" step="any" value={coords.endLng} onChange={(e) => setCoords({...coords, endLng: e.target.value})} className="text-xs h-9 bg-white" required />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Unggah Foto Lokasi</label>
        <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-100 transition-colors flex items-center justify-between cursor-pointer overflow-hidden">
          <span className="text-xs text-slate-500 truncate pr-4 flex items-center gap-1.5">
            <FileImage className="h-4 w-4 text-slate-400 shrink-0" />
            {fileName || 'Pilih berkas foto...'}
          </span>
          <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} className="absolute inset-0 opacity-0 cursor-pointer" />
          <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider bg-white shrink-0 pointer-events-none">Pilih</Button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-10 rounded-xl shadow-md mt-6 transition-all duration-200" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Simpan Segmen Survei
      </Button>
    </form>
  );
}
export default SurveyForm;
