'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateLogInput } from '@/services/logs/create-log';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Loader2 } from 'lucide-react';

interface AddLogDialogProps {
  segmentId: string;
  onSuccess: (input: CreateLogInput) => Promise<void>;
  operatorName: string;
}

export function AddLogDialog({ segmentId, onSuccess, operatorName }: AddLogDialogProps) {
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<'inspeksi' | 'pemeliharaan' | 'perbaikan' | 'update_status'>('pemeliharaan');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSuccess({
        segment_id: segmentId,
        action_type: actionType,
        description,
        operator_name: operatorName || 'Petugas PUPR',
      });
      setDescription('');
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs bg-white" />}>
        <Plus className="h-3.5 w-3.5" />Tambah Aktivitas
      </DialogTrigger>
      <DialogContent className="max-w-sm bg-white rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">Catat Aktivitas Drainase</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Jenis Aktivitas</label>
            <Select value={actionType} onValueChange={(val: any) => setActionType(val)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inspeksi">Inspeksi Lapangan</SelectItem>
                <SelectItem value="pemeliharaan">Pembersihan / Pemeliharaan</SelectItem>
                <SelectItem value="perbaikan">Rehabilitasi / Perbaikan Fisik</SelectItem>
                <SelectItem value="update_status">Pembaruan Status</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Deskripsi Pekerjaan</label>
            <Input
              placeholder="Deskripsikan detail pekerjaan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Simpan Aktivitas
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default AddLogDialog;
