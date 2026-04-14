import 'dart:math';

class ReferenceGenerator {
  ReferenceGenerator._();

  static final _random = Random.secure();

  /// Generates a unique order reference e.g. ORD-20240407-A3F9
  static String orderRef() {
    final date = DateTime.now();
    final dateStr =
        '${date.year}${_pad(date.month)}${_pad(date.day)}';
    final suffix = _randomAlphaNum(4).toUpperCase();
    return 'ORD-$dateStr-$suffix';
  }

  /// Generates a transaction reference e.g. TXN-A1B2C3D4
  static String transactionRef() {
    return 'TXN-${_randomAlphaNum(8).toUpperCase()}';
  }

  /// Generates a short unique ID of given length.
  static String shortId([int length = 8]) {
    return _randomAlphaNum(length);
  }

  static String _randomAlphaNum(int length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return List.generate(length, (_) => chars[_random.nextInt(chars.length)])
        .join();
  }

  static String _pad(int value) => value.toString().padLeft(2, '0');
}
