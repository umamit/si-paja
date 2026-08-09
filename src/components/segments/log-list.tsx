import { MaintenanceLog } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, FileText } from 'lucide-react';

interface LogListProps {
  logs: MaintenanceLog[];
}

const actionColors: Record<string, string> = {
  inspeksi: 'bg-blue-100 text-blue-800 border-blue-200',
  pemeliharaan: 'bg-amber-100 text-amber-800 border-amber-200',
  perbaikan: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  update_status: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return <p className="text-xs text-slate-400 py-4 text-center">Belum ada catatan aktivitas.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="relative border-l border-slate-200 pl-4 ml-2 space-y-5">
        {logs.map((log) => (
          <div key={log.id} className="relative">
            {/* Timeline bullet dot */}
            <span className="absolute -left-[21px] top-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-slate-250 ring-4 ring-white" />
            
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`text-[9px] uppercase tracking-wider border ${actionColors[log.action_type]}`}>
                  {log.action_type.replace('_', ' ')}
                </Badge>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(log.created_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold leading-relaxed">{log.description}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <User className="h-3 w-3" />
                Oleh: {log.operator_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default LogList;
