import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import '../models/segment_model.dart';

class LocalDbRepository {
  static Database? _database;

  Future<Database> get database async {
    if (_database != null) return _database!;
    _database = await _initDb();
    return _database!;
  }

  Future<Database> _initDb() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'sipaja_offline.db');

    return await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE local_segments (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            start_lat REAL NOT NULL,
            start_lng REAL NOT NULL,
            end_lat REAL NOT NULL,
            end_lng REAL NOT NULL,
            length_m REAL NOT NULL,
            width_cm REAL NOT NULL,
            depth_cm REAL NOT NULL,
            material TEXT NOT NULL,
            condition TEXT NOT NULL,
            description TEXT,
            photo_url TEXT,
            photo_after_url TEXT,
            start_elevation_m REAL DEFAULT 0.0,
            end_elevation_m REAL DEFAULT 0.0,
            category TEXT DEFAULT 'existing',
            gps_source TEXT DEFAULT 'manual_input',
            surveyor_id TEXT,
            path_coordinates TEXT,
            created_at TEXT,
            is_synced INTEGER DEFAULT 0
          )
        ''');
      },
    );
  }

  /// Menyimpan atau memperbarui draf segmen secara offline
  Future<void> insertSegment(SegmentModel segment) async {
    final db = await database;
    await db.insert(
      'local_segments',
      segment.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  /// Membaca semua segmen yang tersimpan di HP
  Future<List<SegmentModel>> getOfflineSegments() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'local_segments',
      orderBy: 'created_at DESC',
    );
    return List.generate(maps.length, (i) => SegmentModel.fromMap(maps[i]));
  }

  /// Membaca draf yang belum disinkronkan ke Supabase
  Future<List<SegmentModel>> getUnsyncedSegments() async {
    final db = await database;
    final List<Map<String, dynamic>> maps = await db.query(
      'local_segments',
      where: 'is_synced = ?',
      whereArgs: [0],
    );
    return List.generate(maps.length, (i) => SegmentModel.fromMap(maps[i]));
  }

  /// Menandai draf parit berhasil diunggah ke Supabase
  Future<void> markAsSynced(String id) async {
    final db = await database;
    await db.update(
      'local_segments',
      {'is_synced': 1},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  /// Menghapus segmen lokal dari HP
  Future<void> deleteSegment(String id) async {
    final db = await database;
    await db.delete(
      'local_segments',
      where: 'id = ?',
      whereArgs: [id],
    );
  }
}
