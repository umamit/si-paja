'use client';
import { useState, useCallback } from 'react';

interface ElevationState {
  startElev: number | null;
  endElev: number | null;
  fetchingStart: boolean;
  fetchingEnd: boolean;
}

export function useCoordElevation() {
  const [state, setState] = useState<ElevationState>({
    startElev: null, endElev: null, fetchingStart: false, fetchingEnd: false,
  });

  const fetchElev = useCallback(async (type: 'start' | 'end', lat: string, lng: string) => {
    const latN = parseFloat(lat), lngN = parseFloat(lng);
    if (isNaN(latN) || isNaN(lngN)) return;

    setState((prev) => ({ ...prev, [type === 'start' ? 'fetchingStart' : 'fetchingEnd']: true }));
    try {
      const res = await fetch(`/api/elevation?lat=${latN}&lng=${lngN}`);
      if (!res.ok) return;
      const data = await res.json();
      const elev: number = data.elevation || 0;
      setState((prev) => ({
        ...prev,
        [type === 'start' ? 'startElev' : 'endElev']: elev,
        [type === 'start' ? 'fetchingStart' : 'fetchingEnd']: false,
      }));
    } catch {
      setState((prev) => ({ ...prev, [type === 'start' ? 'fetchingStart' : 'fetchingEnd']: false }));
    }
  }, []);

  return { ...state, fetchElev };
}
