import 'package:flutter/material.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/utils/platform_responsive.dart';
import '../../../../../core/widgets/app_text.dart';

class OnboardingContent extends StatelessWidget {
  final String image;
  final String title;
  final String subtitle;

  const OnboardingContent({
    super.key,
    required this.image,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const Spacer(),
        // Onboarding Image
        Container(
          height: PlatformResponsive.h(300),
          width: double.infinity,
          decoration: BoxDecoration(
            image: DecorationImage(
              image: AssetImage(image),
              fit: BoxFit.contain,
            ),
          ),
        ),
        const Spacer(),
        // Text Content
        Padding(
          padding: EdgeInsets.symmetric(
            horizontal: PlatformResponsive.w(19),
          ),
          child: Column(
            children: [
              AppText.headingLarge(
                title,
                align: TextAlign.center,
                color: AppColors.textPrimary,
              ),
              SizedBox(height: PlatformResponsive.h(16)),
              AppText.bodySecondary(
                subtitle,
                align: TextAlign.center,
              ),
            ],
          ),
        ),
        const Spacer(),
      ],
    );
  }
}
