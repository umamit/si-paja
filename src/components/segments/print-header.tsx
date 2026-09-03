'use client';

interface PrintHeaderProps {
  selectedRoad: string;
}

export function PrintHeader({ selectedRoad }: PrintHeaderProps) {
  return (
    <div>
      {/* Kop Surat Resmi Dinas PUPR */}
      <div className="flex items-center justify-center border-b-4 border-double border-slate-900 pb-4 mb-6 gap-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-pupr.png" alt="Logo PUPR" className="h-16 w-auto object-contain shrink-0" />
        <div className="text-center">
          <h2 className="text-lg font-bold uppercase tracking-wide">Pemerintah Kabupaten Pulau Taliabu</h2>
          <h1 className="text-xl font-extrabold uppercase tracking-wide mt-0.5">Dinas Pekerjaan Umum dan Penataan Ruang</h1>
          <p className="text-[10px] italic text-slate-500 mt-0.5">
            Alamat: Jalan Jalur Dua, Bobong, Pulau Taliabu, Maluku Utara &bull; Email: pupr@taliabukab.go.id
          </p>
        </div>
      </div>

      {/* Judul Laporan */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold uppercase underline">Laporan Inventarisasi & Kondisi Jaringan Drainase</h3>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          {selectedRoad === 'ALL' ? 'Seluruh Ruang Jalan - Kota Bobong' : `Ruang Jalan: ${selectedRoad}`}
        </p>
      </div>
    </div>
  );
}
