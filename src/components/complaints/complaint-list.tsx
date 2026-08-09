'use client';

import { PublicComplaint } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, MapPin, CheckCircle, Navigation } from 'lucide-react';

interface ComplaintListProps {
  complaints: PublicComplaint[];
  onUpdateStatus: (id: string, status: 'ditinjau' | 'selesai') => void;
  onInspect: (complaint: PublicComplaint) => void;
}

export function ComplaintList({ complaints, onUpdateStatus, onInspect }: ComplaintListProps) {
  const statusColors: Record<string, string> = {
    menunggu: 'bg-orange-100 text-orange-850 border-orange-250',
    ditinjau: 'bg-blue-100 text-blue-800 border-blue-250',
    selesai: 'bg-emerald-100 text-emerald-800 border-emerald-250',
  };

  if (complaints.length === 0) {
    return (
      <div className="bg-white border rounded-xl p-8 text-center text-slate-400">
        Belum ada aduan masuk dari warga Bobong.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {complaints.map((c) => (
        <Card key={c.id} className="border border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col justify-between">
          <CardContent className="p-5 space-y-3 flex-1">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[11px] font-bold text-slate-450 tracking-wider">ADUAN WARGA</span>
              <Badge className={`capitalize border ${statusColors[c.status]}`}>
                {c.status}
              </Badge>
            </div>
            
            <h3 className="font-bold text-slate-900 leading-snug">{c.issue_desc}</h3>
            
            <div className="text-[11px] text-slate-500 space-y-1.5 pt-1">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <strong>Lokasi:</strong> {c.location_desc}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <strong>Pelapor:</strong> {c.reporter_name} ({c.reporter_contact})
              </p>
              <p className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <strong>Masuk:</strong> {new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </CardContent>

          <div className="bg-slate-50/50 px-5 py-3 border-t flex items-center justify-between gap-3 text-right">
            {c.status === 'menunggu' && (
              <Button size="sm" variant="outline" className="h-8 text-xs bg-white border-slate-200" onClick={() => onInspect(c)}>
                <Navigation className="h-3.5 w-3.5 mr-1" />Survei Fisik
              </Button>
            )}
            
            <div className="flex gap-2 ml-auto">
              {c.status === 'menunggu' && (
                <Button size="sm" variant="outline" className="h-8 text-xs bg-white text-blue-600 border-blue-200" onClick={() => onUpdateStatus(c.id, 'ditinjau')}>
                  Tinjau Lokasi
                </Button>
              )}
              {c.status !== 'selesai' && (
                <Button size="sm" className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onUpdateStatus(c.id, 'selesai')}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />Selesai
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
export default ComplaintList;
