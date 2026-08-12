'use client';
import { useState } from 'react';
import { CreateSegmentInput } from '@/services/segments/create-segment';
import { Button } from '@/components/ui/button'; import { Input } from '@/components/ui/input'; import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client'; import { Loader2, FileImage } from 'lucide-react';
import { DrainageSegment } from '@/types';
import { useCoordElevation } from '@/hooks/use-coord-elevation'; import { CoordInput } from './coord-input'; import { compressImage } from '@/lib/image-compression';
const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
export function SurveyForm({ onSuccess, surveyorId, segments = [] }: { onSuccess: (input: CreateSegmentInput, updateId?: string) => void; surveyorId?: string; segments?: DrainageSegment[]; }) {
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [selectedId, setSelectedId] = useState('');
  const [form, setForm] = useState({ name: '', description: '', category: 'existing' as any, material: 'pasangan_batu' as any, condition: 'baik' as any, lengthM: '', widthCm: '', depthCm: '' });
  const [coords, setCoords] = useState({ startLat: '', startLng: '', endLat: '', endLng: '' });
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const { startElev, endElev, fetchingStart, fetchingEnd, fetchElev } = useCoordElevation();

  const handleSelectSegment = (id: any) => {
    const s = segments.find(x => x.id === id);
    if (!s) return;
    setSelectedId(id);
    setForm({ name: s.name, description: s.description || '', category: s.category || 'existing', material: s.material, condition: s.condition, lengthM: String(s.length_m), widthCm: String(s.width_cm), depthCm: String(s.depth_cm) });
    setCoords({ startLat: String(s.start_lat || ''), startLng: String(s.start_lng || ''), endLat: String(s.end_lat || ''), endLng: String(s.end_lng || '') });
  };
  const getDeviceLocation = (type: 'start' | 'end') => {
    navigator.geolocation?.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude.toFixed(6), lng = pos.coords.longitude.toFixed(6);
      setCoords((prev) => ({ ...prev, [type === 'start' ? 'startLat' : 'endLat']: lat, [type === 'start' ? 'startLng' : 'endLng']: lng }));
      fetchElev(type, lat, lng);
    });
  };
  const handlePhotoUpload = async (file: File) => {
    if (isPlaceholder) return URL.createObjectURL(file);
    const compressed = await compressImage(file);
    const path = `segments/${Date.now()}.jpg`;
    const { error } = await supabase.storage.from('drainage-photos').upload(path, compressed);
    if (error) throw error;
    return supabase.storage.from('drainage-photos').getPublicUrl(path).data.publicUrl;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
      const photoUrl = fileInput?.files?.[0] ? (await handlePhotoUpload(fileInput.files[0])) || '' : '';
      onSuccess({
        name: form.name, description: form.description || undefined, material: form.material, condition: form.condition, category: form.category,
        length_m: parseFloat(form.lengthM), width_cm: parseFloat(form.widthCm), depth_cm: parseFloat(form.depthCm),
        start_lat: parseFloat(coords.startLat), start_lng: parseFloat(coords.startLng), end_lat: parseFloat(coords.endLat), end_lng: parseFloat(coords.endLng),
        photo_url: photoUrl || undefined, gps_source: 'device_gps', surveyor_id: surveyorId,
        start_elevation_m: startElev ?? 0,
        end_elevation_m: endElev ?? 0,
      }, mode === 'update' ? selectedId : undefined);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const wVal = parseFloat(form.widthCm);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-lg bg-white p-4 rounded-xl border border-slate-100 shadow-sm text-slate-800 text-xs">
      <div className="grid grid-cols-2 gap-3 bg-slate-50/50 p-2 rounded-lg border border-slate-150">
        <div>
          <label className="text-[9px] font-bold text-slate-500 uppercase">Mode Form</label>
          <Select value={mode} onValueChange={(val: any) => { setMode(val); setSelectedId(''); setForm({ name: '', description: '', category: 'existing', material: 'pasangan_batu', condition: 'baik', lengthM: '', widthCm: '', depthCm: '' }); setCoords({ startLat: '', startLng: '', endLat: '', endLng: '' }); }}>
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

      <Input placeholder="Nama Segmen (contoh: Jl. Gajah Mada Segmen A)" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="h-9 bg-slate-50/20" required />
      <Textarea placeholder="Deskripsi / catatan tambahan (opsional)" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="resize-none text-xs bg-slate-50/20 min-h-[60px]" rows={2} />
      
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'category', label: 'Kategori', opt: [{v:'existing',l:'Eksisting'}, {v:'proposed',l:'Rencana'}] },
          { key: 'material', label: 'Material', opt: [{v:'pasangan_batu',l:'Batu Kali'}, {v:'beton_precast',l:'Precast'}, {v:'tanah',l:'Tanah'}, {v:'belum_ada',l:'Belum Ada'}, {v:'lainnya',l:'Lainnya'}] },
          { key: 'condition', label: 'Kondisi', opt: [{v:'baik',l:'Baik'}, {v:'rusak_ringan',l:'R. Ringan'}, {v:'rusak_berat',l:'R. Berat'}, {v:'tersumbat',l:'Tersumbat'}] }
        ] as const).map((sel) => (
          <div key={sel.key}>
            <label className="text-[9px] font-bold text-slate-500 uppercase pl-0.5">{sel.label}</label>
            <Select value={form[sel.key]} onValueChange={(val: any) => setForm({...form, [sel.key]: val})}>
              <SelectTrigger className="w-full h-9"><SelectValue /></SelectTrigger>
              <SelectContent>{sel.opt.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {([
          { label: 'Panjang (L) (m)', value: form.lengthM, key: 'lengthM' },
          { label: 'Lebar (B) (cm)', value: form.widthCm, key: 'widthCm' },
          { label: 'Tinggi (H) (cm)', value: form.depthCm, key: 'depthCm' }
        ] as const).map((input) => (
          <div key={input.key}>
            <label className="text-[9px] font-bold text-slate-500 uppercase pl-0.5">{input.label}</label>
            <Input type="number" step="any" value={input.value} onChange={(e) => setForm({...form, [input.key]: e.target.value})} className="h-9" required />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50/80 rounded-lg border border-slate-200/60">
        <span className="text-[9px] text-slate-500 font-bold uppercase">Klasifikasi Otomatis</span>
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all duration-250 ${
          !form.widthCm || isNaN(wVal) ? 'text-slate-550 bg-slate-100/85 border-slate-300/80' :
          wVal >= 150 ? 'text-rose-600 bg-rose-50 border-rose-200' :
          wVal >= 50 ? 'text-amber-600 bg-amber-50 border-amber-250' : 'text-emerald-600 bg-emerald-50 border-emerald-200'
        }`}>
          {!form.widthCm || isNaN(wVal) ? 'Masukkan Lebar (B)' : wVal >= 150 ? 'Primer' : wVal >= 50 ? 'Sekunder' : 'Tersier'}
        </span>
      </div>

      <CoordInput type="start" lat={coords.startLat} lng={coords.startLng} elev={startElev} fetching={fetchingStart}
        onChangeLat={(v) => setCoords({ ...coords, startLat: v })} onChangeLng={(v) => setCoords({ ...coords, startLng: v })}
        onBlur={() => fetchElev('start', coords.startLat, coords.startLng)} onGps={() => getDeviceLocation('start')} />
      <CoordInput type="end" lat={coords.endLat} lng={coords.endLng} elev={endElev} fetching={fetchingEnd}
        onChangeLat={(v) => setCoords({ ...coords, endLat: v })} onChangeLng={(v) => setCoords({ ...coords, endLng: v })}
        onBlur={() => fetchElev('end', coords.endLat, coords.endLng)} onGps={() => getDeviceLocation('end')} />

      <div>
        <label className="block text-[9px] font-bold text-slate-500 uppercase pl-0.5">Unggah Foto Lokasi</label>
        <div className="relative border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 hover:bg-slate-100 flex items-center justify-between cursor-pointer overflow-hidden">
          <span className="text-[11px] text-slate-550 truncate pr-4 flex items-center gap-1.5"><FileImage className="h-4 w-4 text-slate-400 shrink-0" />{fileName || 'Pilih berkas foto...'}</span>
          <input id="photo-upload" type="file" accept="image/*" onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} className="absolute inset-0 opacity-0 cursor-pointer" />
          <Button type="button" size="sm" variant="outline" className="h-6.5 text-[9px] font-bold uppercase bg-white shrink-0 pointer-events-none">Pilih</Button>
        </div>
      </div>

      <Button type="submit" className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-9.5 rounded-xl shadow-md mt-4" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{mode === 'update' ? 'Simpan Pembaruan Segmen' : 'Simpan Segmen Baru'}
      </Button>
    </form>
  );
}
export default SurveyForm;
