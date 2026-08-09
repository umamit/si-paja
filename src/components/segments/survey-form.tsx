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
  const [form, setForm] = useState({
    name: '', category: 'existing' as 'existing' | 'proposed',
    material: 'pasangan_batu' as any, condition: 'baik' as any,
    lengthM: '', widthCm: '', depthCm: ''
  });
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
      const photoUrl = fileInput?.files?.[0] ? (await handlePhotoUpload(fileInput.files[0])) || '' : '';
      onSuccess({
        name: form.name, material: form.material, condition: form.condition, category: form.category,
        length_m: parseFloat(form.lengthM), width_cm: parseFloat(form.widthCm), depth_cm: parseFloat(form.depthCm),
        start_lat: parseFloat(coords.startLat), start_lng: parseFloat(coords.startLng),
        end_lat: parseFloat(coords.endLat), end_lng: parseFloat(coords.endLng),
        photo_url: photoUrl || undefined, gps_source: 'device_gps', surveyor_id: surveyorId,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg bg-white p-5 rounded-xl border border-slate-100 shadow-sm text-slate-800">
      <Input placeholder="Nama Segmen (contoh: Jl. Gajah Mada Segmen A)" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="text-xs h-10" required />
      
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Kategori</label>
          <Select value={form.category} onValueChange={(val: any) => setForm({...form, category: val})}>
            <SelectTrigger className="w-full text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="existing">Eksisting</SelectItem><SelectItem value="proposed">Rencana</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Material</label>
          <Select value={form.material} onValueChange={(val: any) => setForm({...form, material: val})}>
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
          <Select value={form.condition} onValueChange={(val: any) => setForm({...form, condition: val})}>
            <SelectTrigger className="w-full text-xs h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="baik">Baik</SelectItem><SelectItem value="rusak_ringan">R. Ringan</SelectItem>
              <SelectItem value="rusak_berat">R. Berat</SelectItem><SelectItem value="tersumbat">Tersumbat</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([
          { label: 'Panjang (m)', value: form.lengthM, key: 'lengthM' },
          { label: 'Lebar (cm)', value: form.widthCm, key: 'widthCm' },
          { label: 'Dalam (cm)', value: form.depthCm, key: 'depthCm' }
        ] as const).map((input) => (
          <div key={input.key} className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">{input.label}</label>
            <Input type="number" step="any" value={input.value} onChange={(e) => setForm({...form, [input.key]: e.target.value})} className="text-xs h-9" required />
          </div>
        ))}
      </div>

      {([
        { type: 'start', label: 'Koordinat Start', lat: 'startLat', lng: 'startLng' },
        { type: 'end', label: 'Koordinat End', lat: 'endLat', lng: 'endLng' }
      ] as const).map((c) => (
        <div key={c.type} className="space-y-2.5 border border-slate-150 p-3.5 rounded-xl bg-slate-50/50">
          <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-600">{c.label}</span>
            <Button type="button" size="sm" variant="outline" className="h-7 text-[10px] font-bold uppercase tracking-wider" onClick={() => getDeviceLocation(c.type)}><Navigation className="h-3 w-3 mr-1" />Ambil GPS</Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder={`${c.type === 'start' ? 'Start' : 'End'} Lat`} type="number" step="any" value={coords[c.lat]} onChange={(e) => setCoords({...coords, [c.lat]: e.target.value})} className="text-xs h-9 bg-white" required />
            <Input placeholder={`${c.type === 'start' ? 'Start' : 'End'} Lng`} type="number" step="any" value={coords[c.lng]} onChange={(e) => setCoords({...coords, [c.lng]: e.target.value})} className="text-xs h-9 bg-white" required />
          </div>
        </div>
      ))}

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
