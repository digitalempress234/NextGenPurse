import 'package:flutter/material.dart';

class AppMessenger {
  AppMessenger._();

  static void showSuccess(BuildContext context, String message) {
    _show(context, message, const Color(0xFF2E7D32), Icons.check_circle_outline);
  }

  static void showError(BuildContext context, String message) {
    _show(context, message, const Color(0xFFC62828), Icons.error_outline);
  }

  static void showInfo(BuildContext context, String message) {
    _show(context, message, const Color(0xFF1565C0), Icons.info_outline);
  }

  static void showWarning(BuildContext context, String message) {
    _show(context, message, const Color(0xFFE65100), Icons.warning_amber_outlined);
  }

  static void _show(
    BuildContext context,
    String message,
    Color backgroundColor,
    IconData icon,
  ) {
    ScaffoldMessenger.of(context).clearSnackBars();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white, fontSize: 14),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }
}
