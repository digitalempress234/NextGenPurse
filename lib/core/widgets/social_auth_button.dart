import 'package:flutter/material.dart';
import '../utils/platform_responsive.dart';

class SocialAuthButton extends StatelessWidget {
  final String label;
  final Widget icon;
  final VoidCallback onPressed;
  final Color backgroundColor;
  final Color foregroundColor;

  const SocialAuthButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    this.backgroundColor = const Color(0xFF1A1A1A),
    this.foregroundColor = Colors.white,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: PlatformResponsive.h(50),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          foregroundColor: foregroundColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
          padding: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(16)),
        ),
        child: Row(
          children: [
            // Icon on the left
            SizedBox(
              width: PlatformResponsive.w(24),
              height: PlatformResponsive.w(24),
              child: icon,
            ),

            // Flexibly centered text
            Expanded(
              child: Center(
                child: Text(
                  label,
                  style: TextStyle(
                    fontSize: PlatformResponsive.sp(14),
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),

            // Empty spacer on the right to mirror the icon and keep text centered
            SizedBox(width: PlatformResponsive.w(24)),
          ],
        ),
      ),
    );
  }
}
