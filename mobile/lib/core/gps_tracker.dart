import 'dart:async';
import 'package:geolocator/geolocator.dart';

class GpsTracker {
  StreamSubscription<Position>? _positionStreamSubscription;
  final List<List<double>> _recordedPath = [];

  /// Memeriksa dan meminta izin lokasi secara dinamis.
  /// Mengembalikan true jika diizinkan, false jika ditolak.
  Future<bool> requestLocationPermission() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) return false;

    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) return false;
    }

    if (permission == LocationPermission.deniedForever) return false;
    return true;
  }

  /// Mendapatkan lokasi tunggal saat ini dengan akurasi tinggi.
  Future<Position?> getCurrentLocation() async {
    final hasPermission = await requestLocationPermission();
    if (!hasPermission) return null;

    try {
      return await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
    } catch (e) {
      return null;
    }
  }

  /// Mulai merekam jalur koordinat (tracking mode).
  /// Memanggil callback [onPositionAdded] setiap kali koordinat baru ditambahkan.
  Future<bool> startTracking(Function(List<List<double>> path) onPositionAdded) async {
    final hasPermission = await requestLocationPermission();
    if (!hasPermission) return false;

    _recordedPath.clear();

    const settings = LocationSettings(
      accuracy: LocationAccuracy.high,
      distanceFilter: 2, // Merekam setiap bergerak minimal 2 meter
    );

    _positionStreamSubscription = Geolocator.getPositionStream(locationSettings: settings).listen(
      (Position position) {
        _recordedPath.add([position.latitude, position.longitude]);
        onPositionAdded(List.from(_recordedPath));
      },
      onError: (error) {
        stopTracking();
      },
    );

    return true;
  }

  /// Menghentikan perekaman jalur koordinat.
  void stopTracking() {
    _positionStreamSubscription?.cancel();
    _positionStreamSubscription = null;
  }

  /// Mendapatkan jalur koordinat yang telah direkam.
  List<List<double>> get recordedPath => _recordedPath;
}
