import { supabase } from '@/lib/supabase/client';
import { PublicComplaint } from '@/types';

const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');

const defaultComplaints: PublicComplaint[] = [
  {
    id: 'complaint-seed-1',
    reporter_name: 'Budi Santoso',
    reporter_contact: '08123456789',
    location_desc: 'Dekat pertigaan pasar utama Bobong',
    issue_desc: 'Tumpukan sampah pasar menghalangi aliran air, jika hujan deras air meluap ke badan jalan setinggi 20cm.',
    status: 'menunggu',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'complaint-seed-2',
    reporter_name: 'Siti Rahma',
    reporter_contact: '08234567890',
    location_desc: 'Depan warung makan daerah pelabuhan',
    issue_desc: 'Dinding beton pembatas drainase amblas runtuh sepanjang 5 meter, menyumbat aliran air.',
    status: 'ditinjau',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
];

export async function getComplaints(): Promise<PublicComplaint[]> {
  if (isPlaceholder) {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('pupr_complaints');
      if (stored) {
        return JSON.parse(stored);
      }
      localStorage.setItem('pupr_complaints', JSON.stringify(defaultComplaints));
      return defaultComplaints;
    }
    return defaultComplaints;
  }

  const { data, error } = await supabase
    .from('public_complaints')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public complaints:', error);
    throw error;
  }

  return data || [];
}
