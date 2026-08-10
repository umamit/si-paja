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
  name text not null,
  start_lat double precision not null,
  start_lng double precision not null,
  end_lat double precision not null,
  end_lng double precision not null,
  length_m numeric not null,
  width_cm numeric not null,
  depth_cm numeric not null,
  material text check (material in ('pasangan_batu', 'beton_precast', 'tanah', 'belum_ada', 'lainnya')) not null,
  condition text check (condition in ('baik', 'rusak_ringan', 'rusak_berat', 'tersumbat')) not null,
  description text,
  photo_url text, -- Foto Sebelum Perbaikan
  photo_after_url text, -- Foto Setelah Perbaikan
  start_elevation_m numeric default 0 not null,
  end_elevation_m numeric default 0 not null,
  category text check (category in ('existing', 'proposed')) default 'existing' not null,
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

-- 3. Maintenance Logs (Log Pemeliharaan)
create table maintenance_logs (
  id uuid default gen_random_uuid() primary key,
  segment_id uuid references drainage_segments(id) on delete cascade not null,
  action_type text check (action_type in ('inspeksi', 'pemeliharaan', 'perbaikan', 'update_status')) not null,
  description text not null,
  operator_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table maintenance_logs enable row level security;

create policy "Maintenance logs are viewable by authenticated users" on maintenance_logs
  for select to authenticated using (true);

create policy "Maintenance logs are insertable by authenticated users" on maintenance_logs
  for insert to authenticated with check (true);

-- 4. Public Complaints (Aduan Masyarakat)
create table public_complaints (
  id uuid default gen_random_uuid() primary key,
  reporter_name text not null,
  reporter_contact text not null,
  location_desc text not null,
  issue_desc text not null,
  photo_url text,
  status text check (status in ('menunggu', 'ditinjau', 'selesai')) default 'menunggu' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public_complaints enable row level security;

create policy "Public complaints are viewable by everyone" on public_complaints
  for select using (true);

create policy "Public complaints can be created by anyone" on public_complaints
  for insert with check (true);

create policy "Public complaints can be updated by authenticated users" on public_complaints
  for update to authenticated using (true);

-- 5. Kredensial & SQL Seed Profile Awal (Referensi Pengembang)
-- Jalankan query di bawah ini di Supabase SQL Editor setelah membuat user di Auth:
-- INSERT INTO public.profiles (id, full_name, role) 
-- VALUES ('76aab6be-9cc3-4780-954a-216b4ec62a6f', 'Anhar (Administrator)', 'admin');

-- 6. Konfigurasi Supabase Storage (Penyimpanan Foto Parit)
-- Jalankan query ini untuk membuat bucket 'drainage-photos' dan kebijakan aksesnya:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('drainage-photos', 'drainage-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Kebijakan akses agar semua foto bisa dilihat publik (Public Read)
CREATE POLICY "Foto parit dapat dilihat publik" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'drainage-photos');

-- Kebijakan agar surveyor/admin yang login bisa mengunggah foto (Authenticated Insert/Update)
CREATE POLICY "Surveyor terotentikasi dapat mengunggah foto" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'drainage-photos');

CREATE POLICY "Surveyor terotentikasi dapat memperbarui foto" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'drainage-photos');


