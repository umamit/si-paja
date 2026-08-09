export type UserRole = 'admin' | 'surveyor';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type MaterialType = 'pasangan_batu' | 'beton_precast' | 'tanah' | 'lainnya';

export type PhysicalCondition = 'baik' | 'rusak_ringan' | 'rusak_berat' | 'tersumbat';

export type GpsSourceType = 'device_gps' | 'file_import' | 'manual_input';

export interface DrainageSegment {
  id: string;
  name: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  length_m: number;
  width_cm: number;
  depth_cm: number;
  material: MaterialType;
  condition: PhysicalCondition;
  description?: string;
  photo_url?: string;
  gps_source: GpsSourceType;
  surveyor_id?: string;
  created_at: string;
}
