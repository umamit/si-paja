import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:uuid/uuid.dart';
import '../../core/gps_tracker.dart';
import '../../core/image_compressor.dart';
import '../../data/models/segment_model.dart';
import '../../data/repositories/local_db_repository.dart';

class SurveyFormScreen extends StatefulWidget {
  const SurveyFormScreen({super.key});

  @override
  State<SurveyFormScreen> createState() => _SurveyFormScreenState();
}

class _SurveyFormScreenState extends State<SurveyFormScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _widthCtrl = TextEditingController(), _depthCtrl = TextEditingController(), _descCtrl = TextEditingController();
  final _localDb = LocalDbRepository();
  final _gpsTracker = GpsTracker();
  final _picker = ImagePicker();

  String _material = 'beton_precast', _condition = 'baik';
  double? _startLat, _startLng, _endLat, _endLng;
  String? _localPhotoPath;
  bool _isLoading = false;

  void _capturePhoto() async {
    final photo = await _picker.pickImage(source: ImageSource.camera);
    if (photo == null) return;
    setState(() => _isLoading = true);
    final compressed = await ImageCompressor.compressImage(photo.path);
    setState(() {
      _localPhotoPath = compressed.path;
      _isLoading = false;
    });
  }

  void _getGpsCoordinates(bool isStart) async {
    final pos = await _gpsTracker.getCurrentLocation();
    if (pos != null) {
      setState(() {
        if (isStart) {
          _startLat = pos.latitude;
          _startLng = pos.longitude;
        } else {
          _endLat = pos.latitude;
          _endLng = pos.longitude;
        }
      });
    }
  }

  void _saveSurvey() async {
    if (!_formKey.currentState!.validate() || _startLat == null || _endLat == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Lengkapi koordinat awal & akhir!'), backgroundColor: Colors.red));
      return;
    }

    final newSegment = SegmentModel(
      id: const Uuid().v4(),
      name: _nameCtrl.text,
      startLat: _startLat!,
      startLng: _startLng!,
      endLat: _endLat!,
      endLng: _endLng!,
      lengthM: 0.0, // Calculated on server or web
      widthCm: double.parse(_widthCtrl.text),
      depthCm: double.parse(_depthCtrl.text),
      material: _material,
      condition: _condition,
      description: _descCtrl.text.isEmpty ? null : _descCtrl.text,
      photoUrl: _localPhotoPath, // Temporary saved local path
      createdAt: DateTime.now().toIso8601String(),
      isSynced: false,
    );

    await _localDb.insertSegment(newSegment);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Data survei tersimpan di HP!'), backgroundColor: Color(0xFF10B981)));
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Survei Parit Baru')),
      body: _isLoading ? const Center(child: CircularProgressIndicator(color: Color(0xFF10B981))) : Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            TextFormField(controller: _nameCtrl, decoration: const InputDecoration(labelText: 'Nama Saluran/Jalan'), validator: (v) => v!.isEmpty ? 'Wajib diisi' : null),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(child: TextFormField(controller: _widthCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Lebar (cm)'), validator: (v) => v!.isEmpty ? 'Wajib' : null)),
              const SizedBox(width: 12),
              Expanded(child: TextFormField(controller: _depthCtrl, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Kedalaman (cm)'), validator: (v) => v!.isEmpty ? 'Wajib' : null)),
            ]),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(value: _material, items: ['beton_precast', 'pasangan_batu', 'tanah', 'belum_ada', 'lainnya'].map((v) => DropdownMenuItem(value: v, child: Text(v.replaceAll('_', ' ')))).toList(), onChanged: (v) => setState(() => _material = v!)),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(value: _condition, items: ['baik', 'rusak_ringan', 'rusak_berat', 'tersumbat'].map((v) => DropdownMenuItem(value: v, child: Text(v.replaceAll('_', ' ')))).toList(), onChanged: (v) => setState(() => _condition = v!)),
            const SizedBox(height: 16),
            Row(children: [
              Expanded(child: ElevatedButton.icon(onPressed: () => _getGpsCoordinates(true), icon: const Icon(Icons.location_on), label: Text(_startLat != null ? 'Awal: Ok' : 'GPS Awal'))),
              const SizedBox(width: 12),
              Expanded(child: ElevatedButton.icon(onPressed: () => _getGpsCoordinates(false), icon: const Icon(Icons.location_on), label: Text(_endLat != null ? 'Akhir: Ok' : 'GPS Akhir'))),
            ]),
            const SizedBox(height: 16),
            ElevatedButton.icon(onPressed: _capturePhoto, icon: const Icon(Icons.camera_alt), label: Text(_localPhotoPath != null ? 'Foto: Tersimpan' : 'Ambil Foto Parit')),
            const SizedBox(height: 12),
            TextFormField(controller: _descCtrl, maxLines: 2, decoration: const InputDecoration(labelText: 'Keterangan Tambahan')),
            const SizedBox(height: 24),
            ElevatedButton(onPressed: _saveSurvey, style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.black), child: const Text('SIMPAN SURVEI')),
          ],
        ),
      ),
    );
  }
}
