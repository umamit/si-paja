'use client';

import { useState } from 'react';
import { DrainageSegment } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Trash2, Download } from 'lucide-react';
import { exportToKML, exportToGeoJSON, exportToCSV } from '@/lib/gis-export';

interface SegmentTableProps {
  segments: DrainageSegment[];
  onViewDetails: (seg: DrainageSegment) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

export function SegmentTable({ segments, onViewDetails, onDelete, isAdmin }: SegmentTableProps) {
  const [search, setSearch] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');

  const filtered = segments.filter((seg) => {
    const matchesSearch = seg.name.toLowerCase().includes(search.toLowerCase());
    const matchesCondition = conditionFilter === 'all' || seg.condition === conditionFilter;
    return matchesSearch && matchesCondition;
  });

  const conditionColors: Record<string, string> = {
    baik: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    rusak_ringan: 'bg-amber-100 text-amber-850 border-amber-200',
    rusak_sedang: 'bg-orange-100 text-orange-800 border-orange-200',
    rusak_berat: 'bg-rose-100 text-rose-800 border-rose-200',
    tersumbat: 'bg-red-100 text-red-900 border-red-250',
    sedimentasi: 'bg-amber-200 text-amber-900 border-amber-300',
    sedang_perbaikan: 'bg-blue-100 text-blue-800 border-blue-200',
    saluran_tanah: 'bg-slate-100 text-slate-800 border-slate-200',
    tutup_rusak: 'bg-purple-100 text-purple-800 border-purple-200',
    lainnya: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-3 flex-grow max-w-lg w-full">
          <Input
            placeholder="Cari segmen jalan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-white"
          />
          <Select value={conditionFilter} onValueChange={(val) => setConditionFilter(val || 'all')}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Semua Kondisi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kondisi</SelectItem>
              <SelectItem value="baik">Baik</SelectItem>
              <SelectItem value="rusak_ringan">Rusak Ringan</SelectItem>
              <SelectItem value="rusak_sedang">Rusak Sedang</SelectItem>
              <SelectItem value="rusak_berat">Rusak Berat</SelectItem>
              <SelectItem value="tersumbat">Tersumbat</SelectItem>
              <SelectItem value="sedimentasi">Sedimentasi</SelectItem>
              <SelectItem value="sedang_perbaikan">Sedang Perbaikan</SelectItem>
              <SelectItem value="saluran_tanah">Saluran Tanah</SelectItem>
              <SelectItem value="tutup_rusak">Tutup Rusak</SelectItem>
              <SelectItem value="lainnya">Lainnya</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end">
          <button onClick={() => exportToKML(filtered)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all" title="Unduh KML Google Earth">
            <Download className="h-3.5 w-3.5" />KML
          </button>
          <button onClick={() => exportToGeoJSON(filtered)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all" title="Unduh GeoJSON GIS">
            <Download className="h-3.5 w-3.5" />GeoJSON
          </button>
          <button onClick={() => exportToCSV(filtered)} className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 shadow-sm transition-all" title="Unduh Rekap CSV Excel">
            <Download className="h-3.5 w-3.5" />CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nama Segmen</th>
                <th className="px-6 py-4">Dimensi (L &times; B &times; H)</th>
                <th className="px-6 py-4">Material</th>
                <th className="px-6 py-4">Kondisi</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    Tidak ada segmen drainase terdaftar.
                  </td>
                </tr>
              ) : (
                filtered.map((seg) => (
                  <tr key={seg.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{seg.name}</td>
                    <td className="px-6 py-4">
                      {seg.length_m}m &times; {seg.width_cm}cm &times; {seg.depth_cm}cm
                    </td>
                    <td className="px-6 py-4 capitalize">{seg.material.replace('_', ' ')}</td>
                    <td className="px-6 py-4">
                      <Badge className={`capitalize border ${conditionColors[seg.condition]}`}>
                        {seg.condition.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-2">
                      <button
                        onClick={() => onViewDetails(seg)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200"
                        title="Lihat Detail"
                      >
                        <Eye className="h-4.5 w-4.5" />
                      </button>
                      {isAdmin && (
                        <button
                          onClick={() => onDelete(seg.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all duration-200"
                          title="Hapus"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default SegmentTable;
