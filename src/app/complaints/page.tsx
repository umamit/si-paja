'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getComplaints } from '@/services/complaints/get-complaints';
import { createComplaint, CreateComplaintInput } from '@/services/complaints/create-complaint';
import { updateComplaint } from '@/services/complaints/update-complaint';
import { PublicComplaint } from '@/types';
import { AppLayout } from '@/components/shared/layout';
import { ComplaintList } from '@/components/complaints/complaint-list';
import { AddComplaintDialog } from '@/components/complaints/add-complaint-dialog';
import { Loader2 } from 'lucide-react';

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<PublicComplaint[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplaints = async () => {
    try {
      const data = await getComplaints();
      setComplaints(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getProfile()
      .then((prof) => {
        if (!prof) {
          router.push('/');
          return;
        }
        return getComplaints();
      })
      .then((data) => {
        if (data) setComplaints(data);
      })
      .catch((err) => {
        console.error(err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleCreateComplaint = async (input: CreateComplaintInput) => {
    try {
      await createComplaint(input);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'ditinjau' | 'selesai') => {
    try {
      await updateComplaint(id, { status });
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInspect = (complaint: PublicComplaint) => {
    // Redirect to segments route with prefilled complaint details
    router.push(
      `/segments?prefill=true&name=${encodeURIComponent('Aduan: ' + complaint.location_desc)}&desc=${encodeURIComponent(complaint.issue_desc)}`
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaduan Drainase Warga</h2>
            <p className="text-sm text-slate-500">
              Pantau laporan sumbatan atau banjir yang diajukan masyarakat Bobong secara langsung.
            </p>
          </div>
          <AddComplaintDialog onSuccess={handleCreateComplaint} />
        </div>

        <ComplaintList
          complaints={complaints}
          onUpdateStatus={handleUpdateStatus}
          onInspect={handleInspect}
        />
      </div>
    </AppLayout>
  );
}
export { ComplaintsPage };
