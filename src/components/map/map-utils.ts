import L from 'leaflet';

export const fixLeafletIcon = () => {
  if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
  }
};

export const conditionColors: Record<string, string> = {
  baik: '#10b981',
  rusak_ringan: '#f59e0b',
  rusak_sedang: '#f97316',
  rusak_berat: '#ef4444',
  tersumbat: '#e11d48',
  sedimentasi: '#d97706',
  sedang_perbaikan: '#3b82f6',
  saluran_tanah: '#64748b',
  tutup_rusak: '#8b5cf6',
  lainnya: '#6366f1',
};

export const conditionLabels: Record<string, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_sedang: 'Rusak Sedang',
  rusak_berat: 'Rusak Berat',
  tersumbat: 'Tersumbat',
  sedimentasi: 'Sedimentasi',
  sedang_perbaikan: 'Sedang Perbaikan',
  saluran_tanah: 'Saluran Tanah',
  tutup_rusak: 'Tutup Saluran Rusak',
  lainnya: 'Lainnya',
};

export const centerLat = -1.9450;
export const centerLng = 124.3790;
