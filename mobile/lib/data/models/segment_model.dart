import 'dart:convert';

class SegmentModel {
  final String id;
  final String name;
  final double startLat;
  final double startLng;
  final double endLat;
  final double endLng;
  final double lengthM;
  final double widthCm;
  final double depthCm;
  final String material;
  final String condition;
  final String? description;
  final String? photoUrl;
  final String? photoAfterUrl;
  final double startElevationM;
  final double endElevationM;
  final String category;
  final String gpsSource;
  final String? surveyorId;
  final List<List<double>>? pathCoordinates;
  final String? createdAt;
  final bool isSynced; // Status sinkronisasi lokal

  SegmentModel({
    required this.id,
    required this.name,
    required this.startLat,
    required this.startLng,
    required this.endLat,
    required this.endLng,
    required this.lengthM,
    required this.widthCm,
    required this.depthCm,
    required this.material,
    required this.condition,
    this.description,
    this.photoUrl,
    this.photoAfterUrl,
    this.startElevationM = 0.0,
    this.endElevationM = 0.0,
    this.category = 'existing',
    this.gpsSource = 'manual_input',
    this.surveyorId,
    this.pathCoordinates,
    this.createdAt,
    this.isSynced = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'start_lat': startLat,
      'start_lng': startLng,
      'end_lat': endLat,
      'end_lng': endLng,
      'length_m': lengthM,
      'width_cm': widthCm,
      'depth_cm': depthCm,
      'material': material,
      'condition': condition,
      'description': description,
      'photo_url': photoUrl,
      'photo_after_url': photoAfterUrl,
      'start_elevation_m': startElevationM,
      'end_elevation_m': endElevationM,
      'category': category,
      'gps_source': gpsSource,
      'surveyor_id': surveyorId,
      'path_coordinates': pathCoordinates != null ? jsonEncode(pathCoordinates) : null,
      'created_at': createdAt,
      'is_synced': isSynced ? 1 : 0,
    };
  }

  factory SegmentModel.fromMap(Map<String, dynamic> map) {
    List<List<double>>? parsedPath;
    if (map['path_coordinates'] != null) {
      final rawPath = map['path_coordinates'];
      final List<dynamic> decoded = rawPath is String ? jsonDecode(rawPath) : rawPath;
      parsedPath = decoded.map((item) => (item as List).map((val) => (val as num).toDouble()).toList()).toList();
    }

    return SegmentModel(
      id: map['id'] as String,
      name: map['name'] as String,
      startLat: (map['start_lat'] as num).toDouble(),
      startLng: (map['start_lng'] as num).toDouble(),
      endLat: (map['end_lat'] as num).toDouble(),
      endLng: (map['end_lng'] as num).toDouble(),
      lengthM: (map['length_m'] as num).toDouble(),
      widthCm: (map['width_cm'] as num).toDouble(),
      depthCm: (map['depth_cm'] as num).toDouble(),
      material: map['material'] as String,
      condition: map['condition'] as String,
      description: map['description'] as String?,
      photoUrl: map['photo_url'] as String?,
      photoAfterUrl: map['photo_after_url'] as String?,
      startElevationM: (map['start_elevation_m'] as num?)?.toDouble() ?? 0.0,
      endElevationM: (map['end_elevation_m'] as num?)?.toDouble() ?? 0.0,
      category: map['category'] as String? ?? 'existing',
      gpsSource: map['gps_source'] as String? ?? 'manual_input',
      surveyorId: map['surveyor_id'] as String?,
      pathCoordinates: parsedPath,
      createdAt: map['created_at'] as String?,
      isSynced: (map['is_synced'] as int? ?? 1) == 1,
    );
  }
}
