'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getProfile } from '@/services/auth/get-profile';
import { getSegments } from '@/services/segments/get-segments';
import { deleteSegment } from '@/services/segments/delete-segment';
import { createSegment, CreateSegmentInput } from '@/services/segments/create-segment';
import { DrainageSegment, Profile } from '@/types';
import { AppLayout } from '@/components/shared/layout';
import { SegmentTable } from '@/components/segments/segment-table';
import { SegmentDetail } from '@/components/segments/segment-detail';
import { SurveyForm } from '@/components/segments/survey-form';
import { GpxImporter } from '@/components/segments/gpx-importer';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function SegmentsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [segments, setSegments] = useState<DrainageSegment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<DrainageSegment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSegments = async () => {
    try {
      const data = await getSegments();
      setSegments(data);
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
        setProfile(prof);
        return getSegments();
      })
      .then((data) => {
        if (data) setSegments(data);
      })
      .catch((err) => {
        console.error(err);
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [router]);

  const handleAddSegment = async (input: CreateSegmentInput) => {
    try {
      await createSegment(input);
      setDialogOpen(false);
      fetchSegments();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSegment = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus segmen drainase ini?')) return;
    try {
      await deleteSegment(id);
      fetchSegments();
    } catch (err) {
      console.error(err);
    }
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Kelola Segmen Drainase</h2>
            <p className="text-sm text-slate-500">
              Registrasi segmen drainase baru, upload file GPX, atau sunting status kondisi di Bobong.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={<Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2" />}>
              <Plus className="h-4.5 w-4.5" />Tambah Segmen / GPS
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-white rounded-xl">
              <DialogHeader>
                <DialogTitle>Tambah Data Drainase</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="manual" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-lg">
                  <TabsTrigger value="manual" className="rounded-md">Survei Manual (GPS Ponsel)</TabsTrigger>
                  <TabsTrigger value="gpx" className="rounded-md flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" />Impor GPX</TabsTrigger>
                </TabsList>
                <TabsContent value="manual" className="mt-4">
                  <SurveyForm onSuccess={handleAddSegment} surveyorId={profile?.id} />
                </TabsContent>
                <TabsContent value="gpx" className="mt-4">
                  <GpxImporter onSuccess={handleAddSegment} surveyorId={profile?.id} />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        <SegmentTable
          segments={segments}
          onViewDetails={setSelectedSegment}
          onDelete={handleDeleteSegment}
          isAdmin={profile?.role === 'admin'}
        />

        <SegmentDetail
          segment={selectedSegment}
          isOpen={selectedSegment !== null}
          onClose={() => setSelectedSegment(null)}
        />
      </div>
    </AppLayout>
  );
}
export { SegmentsPage };
