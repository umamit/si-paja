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
      <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" />}>
        <PlusCircle className="h-4.5 w-4.5" />Kirim Aduan Warga
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Form Aduan Kerusakan / Sumbatan Drainase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input placeholder="Nama lengkap Anda..." value={name} onChange={(e) => setName(e.target.value)} required />
          <Input placeholder="Nomor kontak/HP aktif..." value={contact} onChange={(e) => setContact(e.target.value)} required />
          <Input placeholder="Deskripsi lokasi aduan (misal: Jl. Mawar dekat masjid)..." value={location} onChange={(e) => setLocation(e.target.value)} required />
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Deskripsi Masalah</label>
            <textarea
              placeholder="Jelaskan kondisi sumbatan/kerusakan drainase secara detail..."
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full text-sm border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
              rows={3}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Kirim Pengaduan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddComplaintDialog;
