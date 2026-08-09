import { useState, useCallback } from 'react';

interface ParsedGpsData {
  name: string;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  lengthM: number;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const p1 = (lat1 * Math.PI) / 180;
  const p2 = (lat2 * Math.PI) / 180;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGpxParser() {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseGpx = useCallback(async (file: File): Promise<ParsedGpsData> => {
    setParsing(true);
    setError(null);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(text, 'text/xml');
          const points: { lat: number; lon: number }[] = [];

          const isKml = file.name.endsWith('.kml') || text.includes('<coordinates');

          if (isKml) {
            const coordNodes = xmlDoc.getElementsByTagName('coordinates');
            if (coordNodes.length === 0) {
              throw new Error('Format KML tidak valid: Tag <coordinates> tidak ditemukan.');
            }
            const pairs = (coordNodes[0].textContent || '').trim().split(/\s+/);
            for (const p of pairs) {
              const parts = p.split(',');
              if (parts.length >= 2) {
                const lon = parseFloat(parts[0]);
                const lat = parseFloat(parts[1]);
                if (!isNaN(lon) && !isNaN(lat)) points.push({ lat, lon });
              }
            }
          } else {
            const trkpts = xmlDoc.getElementsByTagName('trkpt');
            for (let i = 0; i < trkpts.length; i++) {
              const lat = parseFloat(trkpts[i].getAttribute('lat') || '0');
              const lon = parseFloat(trkpts[i].getAttribute('lon') || '0');
              points.push({ lat, lon });
            }
          }

          if (points.length === 0) {
            throw new Error('Tidak ditemukan titik koordinat dalam file GPS.');
          }

          const start = points[0];
          const end = points[points.length - 1];

          let totalLength = 0;
          for (let i = 0; i < points.length - 1; i++) {
            totalLength += haversineDistance(
              points[i].lat,
              points[i].lon,
              points[i + 1].lat,
              points[i + 1].lon
            );
          }

          const nameNode = xmlDoc.getElementsByTagName('name')[0];
          const name = nameNode?.textContent || file.name.replace(/\.[^/.]+$/, '');

          resolve({
            name,
            startLat: start.lat,
            startLng: start.lon,
            endLat: end.lat,
            endLng: end.lon,
            lengthM: parseFloat(totalLength.toFixed(1)),
          });
        } catch (err: any) {
          setError(err.message || 'Gagal membaca file GPS.');
          reject(err);
        } finally {
          setParsing(false);
        }
      };
      reader.onerror = () => {
        setError('Gagal membaca file.');
        setParsing(false);
        reject(new Error('Gagal membaca file.'));
      };
      reader.readAsText(file);
    });
  }, []);

  return { parseGpx, parsing, error };
}
