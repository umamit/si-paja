import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../../core/gps_tracker.dart';
import '../../data/models/segment_model.dart';
import '../../data/repositories/local_db_repository.dart';
import '../../data/repositories/sync_repository.dart';
import '../survey/survey_form_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  final _localDb = LocalDbRepository();
  final _syncRepo = SyncRepository();
  final _gpsTracker = GpsTracker();
  final _mapController = MapController();
  List<SegmentModel> _segments = [];
  List<LatLng> _livePath = [];
  bool _isTracking = false;
  LatLng _center = const LatLng(-1.8845, 124.4842); // Bobong Center

  @override
  void initState() {
    super.initState();
    _loadSegments();
    _initCurrentLocation();
  }

  Future<void> _loadSegments() async {
    await _syncRepo.downloadAndCacheSegments();
    final data = await _localDb.getOfflineSegments();
    if (mounted) setState(() => _segments = data);
  }

  Future<void> _initCurrentLocation() async {
    final pos = await _gpsTracker.getCurrentLocation();
    if (pos != null) {
      final myLoc = LatLng(pos.latitude, pos.longitude);
      setState(() => _center = myLoc);
      _mapController.move(myLoc, 15);
    }
  }

  void _toggleTracking() async {
    if (_isTracking) {
      _gpsTracker.stopTracking();
      setState(() => _isTracking = false);
      if (_livePath.length >= 2) {
        final save = await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Simpan Jalur?'),
            content: Text('Simpan hasil perekaman jalur ${_livePath.length} koordinat ke draf survei parit baru?'),
            actions: [
              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
              TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Simpan')),
            ],
          ),
        );
        if (save == true && mounted) {
          Navigator.push(context, MaterialPageRoute(builder: (_) => SurveyFormScreen(prefilledPath: _livePath))).then((_) => _loadSegments());
        }
      } else {
        _loadSegments();
      }
    } else {
      final success = await _gpsTracker.startTracking((path) {
        setState(() {
          _livePath = path.map((coords) => LatLng(coords[0], coords[1])).toList();
          if (_livePath.isNotEmpty) _mapController.move(_livePath.last, _mapController.camera.zoom);
        });
      });
      if (success) setState(() => _isTracking = true);
    }
  }

  Color _getConditionColor(String condition) {
    if (condition == 'baik') return const Color(0xFF10B981);
    if (condition == 'rusak_ringan') return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    final polylines = _segments.where((s) => s.pathCoordinates != null).map((s) {
      return Polyline(
        points: s.pathCoordinates!.map((coords) => LatLng(coords[0], coords[1])).toList(),
        strokeWidth: s.widthCm >= 150 ? 5.0 : 3.0,
        color: _getConditionColor(s.condition),
      );
    }).toList();

    if (_isTracking && _livePath.isNotEmpty) {
      polylines.add(Polyline(points: _livePath, strokeWidth: 4.0, color: Colors.blueAccent));
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Peta Drainase'), actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: _loadSegments)]),
      body: FlutterMap(
        mapController: _mapController,
        options: MapOptions(initialCenter: _center, initialZoom: 15.0),
        children: [
          TileLayer(urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', userAgentPackageName: 'com.pupr.sipaja'),
          PolylineLayer(polylines: polylines),
          if (_livePath.isNotEmpty)
            MarkerLayer(markers: [Marker(point: _livePath.last, child: const Icon(Icons.my_location, color: Colors.blueAccent, size: 24))]),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _toggleTracking,
        backgroundColor: _isTracking ? Colors.red : const Color(0xFF10B981),
        child: Icon(_isTracking ? Icons.stop : Icons.play_arrow, color: Colors.black),
      ),
    );
  }
}
