import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/supabase_config.dart';
import 'presentation/auth/login_screen.dart';

import 'presentation/map/map_screen.dart';
import 'presentation/survey/survey_form_screen.dart';
import 'data/repositories/local_db_repository.dart';
import 'data/repositories/sync_repository.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Supabase.initialize(
    url: SupabaseConfig.url,
    anonKey: SupabaseConfig.anonKey,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    final session = Supabase.instance.client.auth.currentSession;
    return MaterialApp(
      title: 'SI-PAJA Mobile',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF10B981),
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: session != null ? const HomeScreen() : const LoginScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _localDb = LocalDbRepository();
  final _syncRepo = SyncRepository();
  int _unsyncedCount = 0;
  bool _isSyncing = false;

  @override
  void initState() {
    super.initState();
    _checkUnsynced();
  }

  Future<void> _checkUnsynced() async {
    final list = await _localDb.getUnsyncedSegments();
    if (mounted) setState(() => _unsyncedCount = list.length);
  }

  void _triggerSync() async {
    setState(() => _isSyncing = true);
    final count = await _syncRepo.syncOfflineSegments();
    await _syncRepo.downloadAndCacheSegments();
    await _checkUnsynced();
    setState(() => _isSyncing = false);
    if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(count > 0 ? '$count data berhasil disinkronkan!' : 'Sinkronisasi selesai.'), backgroundColor: const Color(0xFF10B981)));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SI-PAJA Mobile'),
        backgroundColor: Theme.of(context).colorScheme.surfaceContainer,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              await Supabase.instance.client.auth.signOut();
              if (context.mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          )
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Icon(Icons.waves_rounded, size: 80, color: Color(0xFF10B981)),
            const SizedBox(height: 16),
            const Text('SI-PAJA Taliabu Mobile', textAlign: TextAlign.center, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const Text('Aplikasi Pemetaan & Survei Lapangan', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 32),
            if (_unsyncedCount > 0) ...[
              Card(
                color: Colors.amber.withOpacity(0.1),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8), side: const BorderSide(color: Colors.amber, width: 0.5)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Row(
                    children: [
                      const Icon(Icons.sync_problem, color: Colors.amber),
                      const SizedBox(width: 12),
                      Expanded(child: Text('Terdapat $_unsyncedCount data survei offline yang belum disinkronkan ke server.', style: const TextStyle(fontSize: 12, color: Colors.amber))),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
            ],
            ElevatedButton.icon(
              onPressed: _isSyncing ? null : _triggerSync,
              icon: _isSyncing ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.black, strokeWidth: 1.5)) : const Icon(Icons.sync),
              label: Text(_isSyncing ? 'SINKRONISASI...' : 'SINKRONKAN DATA'),
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.black, padding: const EdgeInsets.symmetric(vertical: 14)),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const MapScreen())),
              icon: const Icon(Icons.map),
              label: const Text('LIHAT PETA DRAINASE'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
            ),
            const SizedBox(height: 12),
            OutlinedButton.icon(
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const SurveyFormScreen())).then((_) => _checkUnsynced()),
              icon: const Icon(Icons.add_location_alt),
              label: const Text('FORM SURVEI BARU'),
              style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 14)),
            ),
          ],
        ),
      ),
    );
  }
}
