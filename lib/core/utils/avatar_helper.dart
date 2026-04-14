import 'package:flutter/material.dart';

class AvatarHelper {
  AvatarHelper._();

  /// Returns the initials from a full name (max 2 characters).
  static String getInitials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || name.trim().isEmpty) return '?';
    if (parts.length == 1) return parts[0][0].toUpperCase();
    return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
  }

  /// Returns a consistent background color based on the name.
  static Color getAvatarColor(String name) {
    const colors = [
      Color(0xFF1565C0),
      Color(0xFF6A1B9A),
      Color(0xFF00695C),
      Color(0xFFBF360C),
      Color(0xFF4527A0),
      Color(0xFF283593),
      Color(0xFF558B2F),
      Color(0xFF6D4C41),
    ];
    final index = name.isEmpty ? 0 : name.codeUnitAt(0) % colors.length;
    return colors[index];
  }

  /// Builds an avatar widget with initials fallback.
  static Widget buildAvatar({
    required String name,
    String? imageUrl,
    double radius = 20,
    double fontSize = 14,
  }) {
    return CircleAvatar(
      radius: radius,
      backgroundColor: getAvatarColor(name),
      backgroundImage: imageUrl != null && imageUrl.isNotEmpty
          ? NetworkImage(imageUrl)
          : null,
      child: imageUrl == null || imageUrl.isEmpty
          ? Text(
              getInitials(name),
              style: TextStyle(
                color: Colors.white,
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
              ),
            )
          : null,
    );
  }
}
