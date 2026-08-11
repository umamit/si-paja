'use client';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mountain, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { backfillElevation, BackfillResult } from '@/services/segments/backfill-elevation';

export function ElevationBackfillCard() {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, name: '' });
  const [result, setResult] = useState<BackfillResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRun = async () => {
    setRunning(true);
    setResult(null);
    setError(null);
    setProgress({ current: 0, total: 0, name: '' });
    try {
      const res = await backfillElevation((current, total, name) =>
        setProgress({ current, total, name })
      );
      setResult(res);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat backfill elevasi.');
    } finally {
      setRunning(false);
    }
  };

  const pct = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <Card className="border-t-4 border-t-emerald-500 border-slate-100 shadow-sm rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-900">
          <Mountain className="h-4 w-4 text-emerald-600" />Sinkronisasi Elevasi DEM
        </CardTitle>
        <CardDescription className="text-[10px] text-slate-400">
          Timpa nilai ketinggian (elevasi) <strong>seluruh segmen</strong> dengan data raster DEMNAS Taliabu yang akurat,
          termasuk segmen yang sebelumnya sudah memiliki elevasi dari Google Earth atau GPS lapangan.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {running && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-500">
              <span className="truncate max-w-[240px]">Memproses: {progress.name}</span>
              <span className="font-bold">{progress.current}/{progress.total} ({pct}%)</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-2 bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}
        {result && !running && (
          <div className="flex flex-wrap gap-2 text-[10px]">
            <Badge className="bg-slate-100 text-slate-700">Total: {result.total}</Badge>
            <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 className="h-3 w-3 mr-1" />Diperbarui: {result.updated}</Badge>
            <Badge className="bg-amber-100 text-amber-800">Dilewati: {result.skipped}</Badge>
            {result.failed > 0 && <Badge className="bg-rose-100 text-rose-800"><AlertCircle className="h-3 w-3 mr-1" />Gagal: {result.failed}</Badge>}
          </div>
        )}
        {error && <p className="text-[10px] text-rose-600 font-medium">{error}</p>}
        <Button onClick={handleRun} disabled={running} size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 rounded-lg gap-2 text-xs">
          {running ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Memproses...</> : <><Mountain className="h-3.5 w-3.5" />Jalankan Backfill Elevasi DEM</>}
        </Button>
      </CardContent>
    </Card>
  );
}
