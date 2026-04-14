import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';

class PromotionalBanner extends StatelessWidget {
  /// Subtitle text
  final String subtitle;

  /// Main title text
  final String title;

  /// Deal/discount text
  final String dealText;

  /// Button text
  final String buttonText;

  /// Image path
  final String imagePath;

  /// Callback when button is tapped
  final VoidCallback? onButtonPressed;

  /// Background color
  final Color backgroundColor;

  const PromotionalBanner({
    super.key,
    this.subtitle = 'Best Deal Online on smart watches',
    this.title = 'SMART WEARABLE.',
    this.dealText = 'UP to 80% OFF',
    this.buttonText = 'Shop Now',
    required this.imagePath,
    this.onButtonPressed,
    this.backgroundColor = const Color(0xFF633186),
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 170.h,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10.r),
        color: backgroundColor,
      ),
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: Row(
        children: [
          // Left Content Section
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Subtitle
                AppText(
                  subtitle,
                  fontSize: 12.sp,
                  color: AppColors.textWhite,
                  fontWeight: FontWeight.w400,
                ),
                // Main Title
                AppText(
                  title,
                  fontSize: 20.sp,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textWhite,
                  maxLines: 2,
                ),
                // Deal Text
                AppText(
                  dealText,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textWhite,
                ),
                // Shop Now Button
                GestureDetector(
                  onTap: onButtonPressed,
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 24.w,
                      vertical: 10.h,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(24.r),
                    ),
                    child: AppText(
                      buttonText,
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textWhite,
                    ),
                  ),
                ),
              ],
            ),
          ),
          SizedBox(width: 12.w),
          // Right Image Section
          Image.asset(
            imagePath,
            width: 120.w,
            height: 170.h,
            fit: BoxFit.contain,
          ),
        ],
      ),
    );
  }
}
