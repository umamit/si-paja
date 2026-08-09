import { useState, useCallback } from 'react';

interface GeolocationResult {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
  getLocation: () => void;
}

export function useGeolocation(): GeolocationResult {
  const [coords, setCoords] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: null,
    longitude: null,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda.');
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        let msg = 'Gagal mendapatkan lokasi GPS.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Izin akses lokasi GPS ditolak oleh pengguna.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Informasi lokasi GPS tidak tersedia.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Waktu permintaan lokasi GPS habis.';
        }
        setError(msg);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    loading,
    error,
    getLocation,
  };
}
