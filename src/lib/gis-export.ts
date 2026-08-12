import { DrainageSegment } from '@/types';

function downloadFile(content: string, filename: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToKML(segments: DrainageSegment[]) {
  let kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Jaringan Drainase Kota Bobong</name>
    <description>Ekspor data spasial parit dari aplikasi SI-PAJA</description>
`;

  segments.forEach((seg) => {
    const coords = seg.path_coordinates && seg.path_coordinates.length > 0
      ? seg.path_coordinates.map(p => `${p[1]},${p[0]},0`).join(' ')
      : `${seg.start_lng},${seg.start_lat},${seg.start_elevation_m || 0} ${seg.end_lng},${seg.end_lat},${seg.end_elevation_m || 0}`;

    kml += `    <Placemark>
      <name>${seg.name}</name>
      <description><![CDATA[
        Kategori: ${seg.category || 'existing'}<br/>
        Dimensi: ${seg.length_m}m x ${seg.width_cm}cm x ${seg.depth_cm}cm<br/>
        Material: ${seg.material}<br/>
        Kondisi: ${seg.condition}<br/>
        Catatan: ${seg.description || '-'}
      ]]></description>
      <LineString>
        <tessellate>1</tessellate>
        <coordinates>${coords}</coordinates>
      </LineString>
    </Placemark>\n`;
  });

  kml += `  </Document>
</kml>`;
  downloadFile(kml, `drainase_bobong_${Date.now()}.kml`, 'application/vnd.google-earth.kml+xml');
}

export function exportToGeoJSON(segments: DrainageSegment[]) {
  const geojson = {
    type: 'FeatureCollection',
    features: segments.map((seg) => {
      const coordinates = seg.path_coordinates && seg.path_coordinates.length > 0
        ? seg.path_coordinates.map(p => [p[1], p[0]])
        : [[seg.start_lng, seg.start_lat], [seg.end_lng, seg.end_lat]];

      return {
        type: 'Feature',
        properties: {
          id: seg.id,
          name: seg.name,
          length_m: Number(seg.length_m),
          width_cm: Number(seg.width_cm),
          depth_cm: Number(seg.depth_cm),
          material: seg.material,
          condition: seg.condition,
          category: seg.category,
          start_elevation_m: seg.start_elevation_m,
          end_elevation_m: seg.end_elevation_m,
          description: seg.description,
        },
        geometry: {
          type: 'LineString',
          coordinates,
        },
      };
    }),
  };
  downloadFile(JSON.stringify(geojson, null, 2), `drainase_bobong_${Date.now()}.geojson`, 'application/geo+json');
}

export function exportToCSV(segments: DrainageSegment[]) {
  const headers = ['Nama Segmen', 'Kategori', 'Panjang (m)', 'Lebar (cm)', 'Dalam (cm)', 'Material', 'Kondisi', 'Elevasi Awal (m)', 'Elevasi Akhir (m)', 'Start Lat', 'Start Lng', 'End Lat', 'End Lng', 'Deskripsi'];
  const rows = segments.map((seg) => [
    `"${seg.name.replace(/"/g, '""')}"`,
    seg.category || 'existing',
    seg.length_m,
    seg.width_cm,
    seg.depth_cm,
    seg.material,
    seg.condition,
    seg.start_elevation_m || 0,
    seg.end_elevation_m || 0,
    seg.start_lat,
    seg.start_lng,
    seg.end_lat,
    seg.end_lng,
    `"${(seg.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadFile(csvContent, `drainase_bobong_${Date.now()}.csv`, 'text/csv;charset=utf-8;');
}
