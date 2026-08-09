'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateSegmentInput } from '@/services/segments/create-segment';
import { Navigation, Loader2 } from 'lucide-react';

interface SurveyFormProps {
  onSuccess: (input: CreateSegmentInput) => void;
  surveyorId?: string;
}

export function SurveyForm({ onSuccess, surveyorId }: SurveyFormProps) {
  const [name, setName] = useState('');
  const [material, setMaterial] = useState<'pasangan_batu' | 'beton_precast' | 'tanah' | 'belum_ada' | 'lainnya'>('pasangan_batu');
  const [condition, setCondition] = useState<'baik' | 'rusak_ringan' | 'rusak_berat' | 'tersumbat'>('baik');
  const [lengthM, setLengthM] = useState('');
  const [widthCm, setWidthCm] = useState('');
  const [depthCm, setDepthCm] = useState('');
  const [coords, setCoords] = useState({ startLat: '', startLng: '', endLat: '', endLng: '' });
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

  const handlePhotoUpload = async (file: File): Promise<string | undefined> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `segments/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
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
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
      <Input placeholder="Nama Segmen (misal: Jl. Gajah Mada Segmen A)" value={name} onChange={(e) => setName(e.target.value)} required />
      
      <div className="grid grid-cols-2 gap-4">
        <Select value={material} onValueChange={(val: any) => setMaterial(val)}>
          <SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="pasangan_batu">Batu Kali</SelectItem>
            <SelectItem value="beton_precast">Beton Precast</SelectItem>
            <SelectItem value="tanah">Tanah</SelectItem>
            <SelectItem value="belum_ada">Belum Ada Drainase</SelectItem>
            <SelectItem value="lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>

        <Select value={condition} onValueChange={(val: any) => setCondition(val)}>
          <SelectTrigger><SelectValue placeholder="Kondisi" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="baik">Baik</SelectItem>
            <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
            <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
            <SelectItem value="tersumbat">Tersumbat</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Input placeholder="Panjang (m)" type="number" step="any" value={lengthM} onChange={(e) => setLengthM(e.target.value)} required />
        <Input placeholder="Lebar (cm)" type="number" step="any" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} required />
        <Input placeholder="Dalam (cm)" type="number" step="any" value={depthCm} onChange={(e) => setDepthCm(e.target.value)} required />
      </div>

      <div className="space-y-2 border p-3 rounded-lg bg-slate-50/50">
        <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-500">Koordinat Start</span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => getDeviceLocation('start')}><Navigation className="h-3 w-3 mr-1" />Ambil GPS</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="Start Lat" type="number" step="any" value={coords.startLat} onChange={(e) => setCoords({...coords, startLat: e.target.value})} required />
          <Input placeholder="Start Lng" type="number" step="any" value={coords.startLng} onChange={(e) => setCoords({...coords, startLng: e.target.value})} required />
        </div>
      </div>

      <div className="space-y-2 border p-3 rounded-lg bg-slate-50/50">
        <div className="flex justify-between items-center"><span className="text-xs font-semibold text-slate-500">Koordinat End</span>
          <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => getDeviceLocation('end')}><Navigation className="h-3 w-3 mr-1" />Ambil GPS</Button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input placeholder="End Lat" type="number" step="any" value={coords.endLat} onChange={(e) => setCoords({...coords, endLat: e.target.value})} required />
          <Input placeholder="End Lng" type="number" step="any" value={coords.endLng} onChange={(e) => setCoords({...coords, endLng: e.target.value})} required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Unggah Foto Lokasi</label>
        <Input id="photo-upload" type="file" accept="image/*" />
      </div>

      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Simpan Segmen
      </Button>
    </form>
  );
}
export default SurveyForm;
