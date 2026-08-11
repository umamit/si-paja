import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import * as GeoTIFF from 'geotiff';

function getMockElevation(lat: number, lng: number): number {
  // Bobong center coordinates
  const centerLat = -1.9450;
  const centerLng = 124.3790;
  
  // Calculate Euclidean distance from center (coastal area)
  const dist = Math.sqrt(Math.pow(lat - centerLat, 2) + Math.pow(lng - centerLng, 2));
  
  // Base elevation is 2.5m, rising to 45m as we move inland, with slight pseudo-random variations
  const elevation = 2.5 + Math.min(dist * 1200, 45.0) + (Math.sin(lat * 800) * Math.cos(lng * 800) * 1.8);
  return parseFloat(elevation.toFixed(1));
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '');
    const lng = parseFloat(searchParams.get('lng') || '');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'Parameter lat dan lng wajib diisi.' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src/data/bobong_dem.tif');
    
    // Check if DEM raster file exists
    if (!fs.existsSync(filePath)) {
      // Return realistic mock elevation if file is missing
      const mockElev = getMockElevation(lat, lng);
      return NextResponse.json({
        elevation: mockElev,
        source: 'mock_fallback',
        message: 'File bobong_dem.tif tidak ditemukan di src/data/. Menggunakan data tiruan Bobong.'
      });
    }

    // Read and parse GeoTIFF file
    const arrayBuffer = fs.readFileSync(filePath).buffer;
    const tiff = await GeoTIFF.fromArrayBuffer(arrayBuffer);
    const image = await tiff.getImage();

    const bbox = image.getBoundingBox(); // [minLng, minLat, maxLng, maxLat]
    const [imageWidth, imageHeight] = [image.getWidth(), image.getHeight()];

    // Map latitude/longitude to pixel coordinates
    const pixelX = Math.round(((lng - bbox[0]) / (bbox[2] - bbox[0])) * imageWidth);
    const pixelY = Math.round(((bbox[3] - lat) / (bbox[3] - bbox[1])) * imageHeight);

    // If coordinates fall outside the bounds of the raster image
    if (pixelX < 0 || pixelX >= imageWidth || pixelY < 0 || pixelY >= imageHeight) {
      return NextResponse.json({
        elevation: 0.0,
        source: 'dem_raster',
        message: 'Koordinat di luar cakupan peta raster.'
      });
    }

    // Read the raster value at the exact pixel
    const rasters = await image.readRasters({
      window: [pixelX, pixelY, pixelX + 1, pixelY + 1],
    });
    
    const elevationValue = Number(rasters[0][0]);

    return NextResponse.json({
      elevation: isNaN(elevationValue) ? 0.0 : parseFloat(elevationValue.toFixed(1)),
      source: 'dem_raster'
    });
  } catch (error: any) {
    console.error('Error in elevation API:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengambil data elevasi.' }, { status: 500 });
  }
}
