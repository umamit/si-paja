import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const defaultSegments: DrainageSegment[] = [
  {
    id: 'seed-1',
    name: 'Saluran Jl. Gajah Mada Segmen A',
    start_lat: -1.8785,
    start_lng: 124.4800,
    end_lat: -1.8795,
    end_lng: 124.4810,
    length_m: 150,
    width_cm: 60,
    depth_cm: 60,
    material: 'beton_precast',
    condition: 'baik',
    description: 'Kondisi beton precast rapi, aliran lancar.',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Drainase Jl. Sultan Hasanuddin',
    start_lat: -1.8795,
    start_lng: 124.4810,
    end_lat: -1.8810,
    end_lng: 124.4825,
    length_m: 230,
    width_cm: 80,
    depth_cm: 100,
    material: 'pasangan_batu',
    condition: 'tersumbat',
    description: 'Sumbatan sedimen pasir dan sampah plastik di persimpangan jalan.',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Saluran Sekitar Pelabuhan Bobong',
    start_lat: -1.8810,
    start_lng: 124.4825,
    end_lat: -1.8825,
    end_lng: 124.4835,
    length_m: 180,
    width_cm: 50,
    depth_cm: 50,
    material: 'tanah',
    condition: 'rusak_berat',
    description: 'Saluran tanah mengalami erosi tebing dinding, perlu turap batu kali.',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function getSegments(): Promise<DrainageSegment[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_segments');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('pupr_segments', JSON.stringify(defaultSegments));
      return defaultSegments;
    }
    return defaultSegments;
  }

  const { data, error } = await supabase
    .from('drainage_segments')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching drainage segments:', error);
    throw error;
  }

  return data || [];
}

