import 'package:supabase_flutter/supabase_flutter.dart';

class AuthRepository {
  final SupabaseClient _client = Supabase.instance.client;

  /// Mendapatkan data pengguna yang sedang login saat ini (jika ada).
  User? get currentUser => _client.auth.currentUser;

  /// Memeriksa apakah pengguna sudah terautentikasi (mempunyai sesi aktif).
  bool get isAuthenticated => _client.auth.currentSession != null;

  /// Melakukan login menggunakan Email dan Password.
  /// Mengembalikan [AuthResponse] jika berhasil, atau melempar exception jika gagal.
  Future<AuthResponse> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _client.auth.signInWithPassword(
        email: email.trim(),
        password: password,
      );
      return response;
    } catch (e) {
      rethrow;
    }
  }

  /// Melakukan logout dan menghapus sesi di HP.
  Future<void> signOut() async {
    try {
      await _client.auth.signOut();
    } catch (e) {
      rethrow;
    }
  }
}
