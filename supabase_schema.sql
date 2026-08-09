-- 1. Users Profile (Extending Supabase Auth)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text check (role in ('admin', 'surveyor')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on profiles
alter table profiles enable row level security;

-- Policies for profiles
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

create policy "Users can update their own profile" on profiles
  for update using (auth.uid() = id);

-- 2. Drainage Segments (Data Segment Drainase)
create table drainage_segments (
  id uuid default gen_random_uuid() primary key,
  name text not null, -- Nama jalan atau nama segmen (e.g., "Jalan Gajah Mada Segmen 1")
  start_lat double precision not null,
  start_lng double precision not null,
  end_lat double precision not null,
  end_lng double precision not null,
  length_m numeric not null, -- Panjang dalam meter
  width_cm numeric not null, -- Lebar dalam centimeter
  depth_cm numeric not null, -- Kedalaman dalam centimeter
  material text check (material in ('pasangan_batu', 'beton_precast', 'tanah', 'lainnya')) not null,
  condition text check (condition in ('baik', 'rusak_ringan', 'rusak_berat', 'tersumbat')) not null,
  description text,
  photo_url text, -- Foto kondisi fisik drainase
  gps_source text check (gps_source in ('device_gps', 'file_import', 'manual_input')) default 'manual_input' not null,
  surveyor_id uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on drainage_segments
alter table drainage_segments enable row level security;

-- Policies for drainage_segments
create policy "Drainage segments are viewable by authenticated users" on drainage_segments
  for select to authenticated using (true);

create policy "Drainage segments are insertable by authenticated surveyors/admins" on drainage_segments
  for insert to authenticated with check (true);

create policy "Drainage segments are updatable by authenticated surveyors/admins" on drainage_segments
  for update to authenticated using (true);

create policy "Drainage segments are deletable by authenticated admins" on drainage_segments
  for delete to authenticated using (true);
