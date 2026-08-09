import { supabase } from '@/lib/supabase/client';
import { MaintenanceLog } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getLogs(segmentId: string): Promise<MaintenanceLog[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_logs');
      const logs: MaintenanceLog[] = stored ? JSON.parse(stored) : [];
      const segmentLogs = logs.filter((log) => log.segment_id === segmentId);
      
      if (segmentLogs.length === 0) {
        // Seed default log for new segment view
        const defaultLog: MaintenanceLog = {
          id: `seed-log-${segmentId}`,
          segment_id: segmentId,
          action_type: 'inspeksi',
          description: 'Inspeksi awal kondisi fisik oleh petugas lapangan.',
          operator_name: 'Surveyor PUPR',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        };
        logs.push(defaultLog);
        localStorage.setItem('pupr_logs', JSON.stringify(logs));
        return [defaultLog];
      }
      
      return segmentLogs.sort((a, b) => b.created_at.localeCompare(a.created_at));
    }
    return [];
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .select('*')
    .eq('segment_id', segmentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching maintenance logs:', error);
    throw error;
  }

  return data || [];
}
