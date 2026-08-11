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
  rusak_berat: '#ef4444',
  tersumbat: '#f97316',
};

export const conditionLabels: Record<string, string> = {
  baik: 'Baik',
  rusak_ringan: 'Rusak Ringan',
  rusak_berat: 'Rusak Berat',
  tersumbat: 'Tersumbat',
};

export const centerLat = -1.9450;
export const centerLng = 124.3790;
