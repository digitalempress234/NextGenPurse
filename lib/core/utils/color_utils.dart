import 'package:flutter/material.dart';

class ColorUtils {
  ColorUtils._();

  /// Converts a hex string (e.g. '#FF5733' or 'FF5733') to a Color.
  static Color fromHex(String hex) {
    final buffer = StringBuffer();
    if (hex.length == 6 || hex.length == 7) buffer.write('ff');
    buffer.write(hex.replaceFirst('#', ''));
    return Color(int.parse(buffer.toString(), radix: 16));
  }

  /// Converts a Color to a hex string (e.g. '#FF5733').
  static String toHex(Color color, {bool includeHash = true}) {
    final hex = color.value.toRadixString(16).padLeft(8, '0').substring(2);
    return includeHash ? '#$hex' : hex;
  }

  /// Returns a darkened version of the color.
  static Color darken(Color color, [double amount = 0.1]) {
    final hsl = HSLColor.fromColor(color);
    return hsl.withLightness((hsl.lightness - amount).clamp(0.0, 1.0)).toColor();
  }

  /// Returns a lightened version of the color.
  static Color lighten(Color color, [double amount = 0.1]) {
    final hsl = HSLColor.fromColor(color);
    return hsl.withLightness((hsl.lightness + amount).clamp(0.0, 1.0)).toColor();
  }

  /// Returns true if the color is considered dark (useful for choosing text color).
  static bool isDark(Color color) {
    return color.computeLuminance() < 0.5;
  }

  /// Returns black or white depending on the background color luminance.
  static Color contrastText(Color background) {
    return isDark(background) ? Colors.white : Colors.black;
  }
}
