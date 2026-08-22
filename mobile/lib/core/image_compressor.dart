import 'dart:io';
import 'package:image/image.dart' as img;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

class ImageCompressor {
  /// Mengompresi file gambar di path [imagePath] ke format JPEG berkualitas medium.
  /// Mengembalikan file terkompresi baru atau file asli jika gagal.
  static Future<File> compressImage(String imagePath) async {
    final file = File(imagePath);
    if (!await file.exists()) return file;

    try {
      final bytes = await file.readAsBytes();
      final image = img.decodeImage(bytes);
      if (image == null) return file;

      // Ubah ukuran gambar jika lebar/tinggi melebihi 1024 piksel
      img.Image resizedImage = image;
      if (image.width > 1024 || image.height > 1024) {
        resizedImage = img.copyResize(
          image,
          width: image.width > image.height ? 1024 : null,
          height: image.height >= image.width ? 1024 : null,
        );
      }

      // Encode ke format JPEG dengan kualitas 75%
      final compressedBytes = img.encodeJpg(resizedImage, quality: 75);

      final tempDir = await getTemporaryDirectory();
      final fileName = 'compressed_${DateTime.now().millisecondsSinceEpoch}${p.extension(imagePath)}';
      final compressedFile = File(p.join(tempDir.path, fileName));

      return await compressedFile.writeAsBytes(compressedBytes);
    } catch (e) {
      return file;
    }
  }
}
