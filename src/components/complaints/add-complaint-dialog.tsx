'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CreateComplaintInput } from '@/services/complaints/create-complaint';
import { PlusCircle, Loader2 } from 'lucide-react';

interface AddComplaintDialogProps {
  onSuccess: (input: CreateComplaintInput) => Promise<void>;
}

export function AddComplaintDialog({ onSuccess }: AddComplaintDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [location, setLocation] = useState('');
  const [issue, setIssue] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess({
        reporter_name: name,
        reporter_contact: contact,
        location_desc: location,
        issue_desc: issue,
        status: 'menunggu',
      });
      setName('');
      setContact('');
      setLocation('');
      setIssue('');
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-[#003366] hover:bg-[#002244] text-white gap-2 h-9 text-xs font-bold uppercase tracking-wider px-4 rounded-lg shadow-sm" />}>
        <PlusCircle className="h-4.5 w-4.5" />Kirim Aduan Warga
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white border border-slate-200 border-t-4 border-t-[#ffcc00] p-6 rounded-2xl shadow-xl text-slate-800">
        <DialogHeader className="border-b pb-3">
          <DialogTitle className="text-base font-extrabold text-slate-900 uppercase tracking-wide">Form Aduan Jaringan Drainase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Nama Pelapor</label>
            <Input placeholder="Masukkan nama lengkap Anda..." value={name} onChange={(e) => setName(e.target.value)} className="text-xs h-9 bg-slate-50/50" required />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Kontak Pelapor</label>
            <Input placeholder="Nomor HP aktif (WhatsApp)..." value={contact} onChange={(e) => setContact(e.target.value)} className="text-xs h-9 bg-slate-50/50" required />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Lokasi Genangan / Sumbatan</label>
            <Input placeholder="Jl. Mawar RT 02 dekat masjid Al-Ikhlas..." value={location} onChange={(e) => setLocation(e.target.value)} className="text-xs h-9 bg-slate-50/50" required />
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider pl-0.5">Deskripsi Masalah</label>
            <textarea
              placeholder="Jelaskan secara detail masalah sumbatan atau kerusakan parit..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full text-xs border border-slate-200 rounded-xl p-3 outline-none focus:ring-1 focus:ring-[#003366] focus:border-[#003366] bg-slate-50/50 min-h-[80px]"
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-[#003366] hover:bg-[#002244] text-white font-bold h-10 rounded-xl shadow-md mt-6 transition-all duration-200" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Kirim Pengaduan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddComplaintDialog;
