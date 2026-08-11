import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as GeoTIFF from 'geotiff';

const DEM_LOCAL_PATH = path.join(process.cwd(), 'src/data/bobong_dem.tif');
const DEM_SUPABASE_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/dem-data/bobong_dem.tif`;

declare global {
  var cachedDemBuffer: ArrayBuffer | null;
}
if (!global.cachedDemBuffer) global.cachedDemBuffer = null;

function getMockElevation(lat: number, lng: number): number {
  const centerLat = -1.9450, centerLng = 124.3790;
  const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
  const elevation = 2.5 + Math.min(dist * 1200, 45.0) + (Math.sin(lat * 800) * Math.cos(lng * 800) * 1.8);
  return parseFloat(elevation.toFixed(1));
}

async function getDemBuffer(): Promise<ArrayBuffer | null> {
  // 1. Return in-memory cache if available
  if (global.cachedDemBuffer) return global.cachedDemBuffer;

  // 2. Try local disk first
  if (fs.existsSync(DEM_LOCAL_PATH)) {
    const buffer = fs.readFileSync(DEM_LOCAL_PATH).buffer;
    global.cachedDemBuffer = buffer;
    return buffer;
  }

  // 3. Fetch from Supabase Storage
  try {
    console.log('[elevation] Fetching DEM from Supabase Storage...');
    const res = await fetch(DEM_SUPABASE_URL);
    if (!res.ok) throw new Error(`Supabase Storage responded with: ${res.status}`);

    const buffer = await res.arrayBuffer();
    global.cachedDemBuffer = buffer;

    // 4. Write-back to disk for future server restarts
    try {
      fs.mkdirSync(path.dirname(DEM_LOCAL_PATH), { recursive: true });
      fs.writeFileSync(DEM_LOCAL_PATH, Buffer.from(buffer));
      console.log('[elevation] DEM file cached to local disk.');
    } catch {
      console.warn('[elevation] Could not write DEM to local disk (read-only fs). Using in-memory cache.');
    }

    return buffer;
  } catch (err) {
    console.error('[elevation] Failed to fetch DEM from Supabase Storage:', err);
    return null;
  }
}

async function queryElevation(buffer: ArrayBuffer, lat: number, lng: number): Promise<number> {
  const tiff = await GeoTIFF.fromArrayBuffer(buffer);
  const image = await tiff.getImage();
  const bbox = image.getBoundingBox();
  const [imageWidth, imageHeight] = [image.getWidth(), image.getHeight()];

  const pixelX = Math.round(((lng - bbox[0]) / (bbox[2] - bbox[0])) * imageWidth);
  const pixelY = Math.round(((bbox[3] - lat) / (bbox[3] - bbox[1])) * imageHeight);

  if (pixelX < 0 || pixelX >= imageWidth || pixelY < 0 || pixelY >= imageHeight) return 0.0;

  const rasters = await image.readRasters({ window: [pixelX, pixelY, pixelX + 1, pixelY + 1] });
  const val = Number(rasters[0][0]);
  return isNaN(val) ? 0.0 : parseFloat(val.toFixed(1));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Parameter lat dan lng wajib diisi.' }, { status: 400 });
    }

    const buffer = await getDemBuffer();

    if (!buffer) {
      return NextResponse.json({
        elevation: getMockElevation(lat, lng),
        source: 'mock_fallback',
        message: 'DEM tidak tersedia dari Supabase Storage. Menggunakan data tiruan.',
      });
    }

    const elevation = await queryElevation(buffer, lat, lng);
    return NextResponse.json({ elevation, source: 'dem_raster' });

  } catch (error: any) {
    console.error('[elevation] Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengambil data elevasi.' }, { status: 500 });
  }
}
