import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'app_text.dart';

class AppBarActionButton extends StatelessWidget {
  /// Path to SVG icon
  final String iconPath;

  /// Callback when button is pressed
  final VoidCallback? onPressed;

  /// Badge count (appears as red circle with number)
  final String? badge;

  const AppBarActionButton({
    super.key,
    required this.iconPath,
    this.onPressed,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Stack(
        children: [
          // Button container - Circular
          Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              border: Border.all(color: const Color(0xFFE5E5E5), width: 1),
            ),
            child: Center(
              child: SvgPicture.asset(
                iconPath,
                width: 20.w,
                height: 20.w,
                colorFilter: const ColorFilter.mode(
                  Color(0xFF1A1A1A),
                  BlendMode.srcIn,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
