import { supabase } from '@/lib/supabase/client';
import { DrainageSegment } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const defaultSegments: DrainageSegment[] = [
  {
    id: 'seed-1',
    name: 'Saluran Jl. Gajah Mada Segmen A',
    start_lat: -1.9445,
    start_lng: 124.3750,
    end_lat: -1.9455,
    end_lng: 124.3770,
    length_m: 150,
    width_cm: 60,
    depth_cm: 60,
    material: 'beton_precast',
    condition: 'baik',
    description: 'Kondisi beton precast rapi, aliran lancar.',
    start_elevation_m: 12,
    end_elevation_m: 10,
    category: 'existing',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'seed-2',
    name: 'Drainase Jl. Sultan Hasanuddin',
    start_lat: -1.9455,
    start_lng: 124.3770,
    end_lat: -1.9470,
    end_lng: 124.3790,
    length_m: 230,
    width_cm: 80,
    depth_cm: 100,
    material: 'pasangan_batu',
    condition: 'tersumbat',
    description: 'Sumbatan sedimen pasir dan sampah plastik di persimpangan jalan.',
    start_elevation_m: 10,
    end_elevation_m: 8,
    category: 'existing',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'seed-3',
    name: 'Saluran Sekitar Pelabuhan Bobong',
    start_lat: -1.9470,
    start_lng: 124.3790,
    end_lat: -1.9485,
    end_lng: 124.3810,
    length_m: 180,
    width_cm: 50,
    depth_cm: 50,
    material: 'tanah',
    condition: 'rusak_berat',
    description: 'Saluran tanah mengalami erosi tebing dinding, perlu turap batu kali.',
    start_elevation_m: 8,
    end_elevation_m: 5,
    category: 'existing',
    gps_source: 'manual_input',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'seed-4',
    name: 'Rencana Saluran Lingkar Taliabu Baru (Masterplan)',
    start_lat: -1.9430,
    start_lng: 124.3740,
    end_lat: -1.9445,
    end_lng: 124.3750,
    length_m: 200,
    width_cm: 100,
    depth_cm: 120,
    material: 'beton_precast',
    condition: 'baik',
    description: 'Usulan saluran pembuangan utama untuk mengurangi beban genangan Jl. Gajah Mada.',
    start_elevation_m: 15,
    end_elevation_m: 12,
    category: 'proposed',
    gps_source: 'manual_input',
    created_at: new Date().toISOString(),
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
export default getSegments;
