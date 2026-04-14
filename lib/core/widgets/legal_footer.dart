import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

class LegalFooter extends StatelessWidget {
  const LegalFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Text.rich(
      textAlign: TextAlign.center,
      TextSpan(
        style: TextStyle(
          color: AppColors.textSecondary,
          fontSize: PlatformResponsive.sp(11),
          fontWeight: FontWeight.w500,
          fontFamily: 'Inter',
          height: 1.5,
        ),
        children: [
          const TextSpan(text: 'By signing up, you agree to our '),
          TextSpan(
            text: 'Terms & Conditions',
            style: TextStyle(
              color: AppColors.primary,
              decoration: TextDecoration.underline,
              decorationColor: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
            recognizer: TapGestureRecognizer()..onTap = () {},
          ),
          const TextSpan(text: ', acknowledging our '),
          TextSpan(
            text: 'Privacy Policy',
            style: TextStyle(
              color: AppColors.primary,
              decoration: TextDecoration.underline,
              decorationColor: AppColors.primary,
              fontWeight: FontWeight.w600,
            ),
            recognizer: TapGestureRecognizer()..onTap = () {},
          ),
          const TextSpan(text: ', and confirm that you are above 18.'),
        ],
      ),
    );
  }
}
