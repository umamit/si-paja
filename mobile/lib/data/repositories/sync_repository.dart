import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:path/path.dart' as p;
import '../models/segment_model.dart';
import 'local_db_repository.dart';

class SyncRepository {
  final _client = Supabase.instance.client;
  final _localDb = LocalDbRepository();

  /// Mengunggah file foto lokal surveyor ke Supabase Storage.
  /// Mengembalikan URL publik berkas jika sukses, atau melempar exception jika gagal.
  Future<String?> _uploadPhoto(String localPath) async {
    final file = File(localPath);
    if (!await file.exists()) return null;

    final fileName = 'survey_${DateTime.now().millisecondsSinceEpoch}${p.extension(localPath)}';
    final filePath = 'uploads/$fileName';

    try {
      await _client.storage.from('drainage-photos').upload(filePath, file);
      final publicUrl = _client.storage.from('drainage-photos').getPublicUrl(filePath);
      return publicUrl;
    } catch (e) {
      rethrow;
    }
  }

  /// Menjalankan antrean proses sinkronisasi draf offline ke Supabase.
  /// Mengembalikan jumlah segmen yang berhasil disinkronkan.
  Future<int> syncOfflineSegments() async {
    final unsynced = await _localDb.getUnsyncedSegments();
    if (unsynced.isEmpty) return 0;

    int successCount = 0;

    for (final segment in unsynced) {
      try {
        String? cloudPhotoUrl = segment.photoUrl;
        String? cloudPhotoAfterUrl = segment.photoAfterUrl;

        // 1. Upload Foto Sebelum Perbaikan jika masih berupa file lokal
        if (segment.photoUrl != null && !segment.photoUrl!.startsWith('http')) {
          final uploaded = await _uploadPhoto(segment.photoUrl!);
          if (uploaded != null) cloudPhotoUrl = uploaded;
        }

        // 2. Upload Foto Setelah Perbaikan jika masih berupa file lokal
        if (segment.photoAfterUrl != null && !segment.photoAfterUrl!.startsWith('http')) {
          final uploaded = await _uploadPhoto(segment.photoAfterUrl!);
          if (uploaded != null) cloudPhotoAfterUrl = uploaded;
        }

        // 3. Konversi model ke Map, bersihkan kolom 'is_synced' sebelum dikirim ke Supabase
        final dataMap = segment.toMap();
        dataMap.remove('is_synced');
        dataMap['photo_url'] = cloudPhotoUrl;
        dataMap['photo_after_url'] = cloudPhotoAfterUrl;

        // 4. Kirim / Upsert ke tabel utama Supabase drainage_segments
        await _client.from('drainage_segments').upsert(dataMap);

        // 5. Update status di SQLite lokal menjadi sukses (is_synced = 1)
        await _localDb.markAsSynced(segment.id);
        successCount++;
      } catch (e) {
        // Abaikan kegagalan baris ini dan lanjutkan ke baris draf berikutnya
        continue;
      }
    }

    return successCount;
  }

  /// Mengunduh data segmen drainase dari Supabase dan memperbarui cache SQLite lokal.
  Future<void> downloadAndCacheSegments() async {
    try {
      final List<dynamic> response = await _client.from('drainage_segments').select();
      for (final raw in response) {
        final data = Map<String, dynamic>.from(raw);
        // Tandai data dari server sebagai sudah tersinkronisasi
        data['is_synced'] = 1;
        
        final segment = SegmentModel.fromMap(data);
        await _localDb.insertSegment(segment);
      }
    } catch (e) {
      // Abaikan jika tidak ada internet, data offline lama tetap aman digunakan
    }
  }
}
