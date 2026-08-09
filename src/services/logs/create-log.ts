import { supabase } from '@/lib/supabase/client';
import { MaintenanceLog } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

export type CreateLogInput = Omit<MaintenanceLog, 'id' | 'created_at'>;

export async function createLog(input: CreateLogInput): Promise<MaintenanceLog> {
  if (isPlaceholder) {
    const newLog: MaintenanceLog = {
      ...input,
      id: `local-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_logs');
      const logs: MaintenanceLog[] = stored ? JSON.parse(stored) : [];
      logs.push(newLog);
      localStorage.setItem('pupr_logs', JSON.stringify(logs));
    }
    return newLog;
  }

  const { data, error } = await supabase
    .from('maintenance_logs')
    .insert([input])
    .select()
    .single();

  if (error) {
    console.error('Error creating maintenance log:', error);
    throw error;
  }

  return data;
}
