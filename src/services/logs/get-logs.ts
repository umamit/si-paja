import { supabase } from '@/lib/supabase/client';
import { MaintenanceLog } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export async function getLogs(segmentId: string): Promise<MaintenanceLog[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_logs');
      const logs: MaintenanceLog[] = stored ? JSON.parse(stored) : [];
      const segmentLogs = logs.filter((log) => log.segment_id === segmentId && !log.id.startsWith('seed-'));
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
export default getLogs;
