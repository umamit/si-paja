# AGENTS.md - Panduan Pengembangan SIG-Drainase Bobong

File ini berisi aturan arsitektur, standar penulisan kode, dan instruksi pemeliharaan proyek yang **WAJIB dipatuhi** oleh semua developer dan AI agent yang bekerja di repositori ini.

---

## 1. Aturan Batasan Kode (Strict Constraints)

* **1 File, 1 Fungsi / Komponen**: Setiap file hanya boleh memiliki satu tanggung jawab utama (Single Responsibility Principle). 
  - File halaman (`page.tsx`) hanya boleh bertindak sebagai assembler (perakit komponen). Logika fetch data, form input, tampilan peta, tabel, dan diagram harus dipisah ke komponen/hook tersendiri.
  - File database helper (`services/`) hanya boleh berisi 1 query database.
  - Custom hook (`hooks/`) hanya boleh mengelola 1 alur state/fungsionalitas tertentu.
* **Batas Maksimal 150 Baris (Max 150 Lines)**: Tidak ada satu pun file kode di dalam direktori `src/` yang boleh melebihi 150 baris kode (termasuk komentar dan impor). Jika melebihi batas ini, pisahkan ke dalam sub-komponen atau utility helper baru.
* **Bebas Data Mock / Dummy**: Semua data harus dibaca atau ditulis secara dinamis dari/ke Supabase. Jika belum ada data, buat kondisi fallback UI kosong (*Empty State*) yang estetik, bukan menampilkan data tiruan statis.

---

## 2. Struktur Proyek

Repositori diatur menggunakan struktur Next.js App Router yang sangat modular:

```
src/
├── app/                  # Route handlers dan Page assembly (hanya impor komponen)
│   ├── layout.tsx        # Root layout utama
│   ├── page.tsx          # Halaman Login
│   ├── dashboard/        # Dashboard overview
│   ├── map/              # GIS Interactive Map
│   └── segments/         # Pengelolaan data segmen drainase & impor GPX
├── components/           # UI Components (Maksimal 150L per file)
│   ├── ui/               # Komponen primitif Shadcn UI
│   ├── dashboard/        # Widget khusus Dashboard (grafik & metrik)
│   ├── segments/         # Tabel data drainase, kartu detail, form survei
│   ├── map/              # Pemeta Leaflet (harus dijalankan sisi klien: Dynamic Import)
│   └── shared/           # Navigasi utama (Sidebar, Header, Loading spinner)
├── hooks/                # Custom React Hooks (< 150L per file)
├── lib/                  # Utilitas eksternal & koneksi client (Supabase, helper cn)
├── services/             # Kumpulan query Supabase (1 file = 1 database operation, < 150L)
└── types/                # TypeScript Types/Interfaces
```

---

## 3. Desain dan Estetika (Premium UI)

* **Skema Warna Premium**: Gunakan palet warna profesional (Slate, Emerald untuk kondisi baik, Amber untuk sumbatan/rusak ringan, Rose untuk rusak berat). Hindari warna dasar murni tanpa harmoni.
* **Tipografi Modern**: Gunakan font modern (misal Inter atau default Sans-serif Next.js) dengan variasi font-weight dan tracking yang baik.
* **Micro-Animations & Transitions**: Gunakan transition-all, hover effects, dan success confetti untuk meningkatkan engagement pengguna saat pengisian data berhasil.
* **Glassmorphism & Shadows**: Gunakan shadow lembut, border transparan, dan backdrop-filter blur untuk nuansa dashboard internal yang modern.

---

## 4. Panduan Database (Supabase)

Sebelum menjalankan aplikasi, pastikan tabel-tabel berikut sudah diatur di proyek Supabase Anda:

1. **profiles**: Menyimpan data surveyor dan admin.
2. **drainage_segments**: Menyimpan data koordinat awal-akhir, dimensi drainase (panjang, lebar, dalam), material, foto, dan status kondisi fisik.

*Skema lengkap SQL migrasi dapat ditemukan di file [supabase_schema.sql](file:///Users/husnitausman/Documents/antigravity/PUPR-SDA/supabase_schema.sql).*

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
