import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';

class PromotionalBannerSection extends StatelessWidget {
  final String? discount;
  final String? title;
  final String? description;
  final String? buttonText;
  final String? imagePath;
  final VoidCallback? onButtonPressed;

  const PromotionalBannerSection({
    super.key,
    this.discount,
    this.title,
    this.description,
    this.buttonText,
    this.imagePath,
    this.onButtonPressed,
  });

  static const String defaultDiscount = 'Flat 30% Discount';
  static const String defaultTitle = 'Sued Cooperate Boots';
  static const String defaultDescription =
      'Lorem ipsum dolor sit amet consectetur. Diam arcu lectus non phasellus tellus.';
  static const String defaultButtonText = 'Shop Now';
  static const String defaultImagePath = 'assets/images/shoe.png';

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Container(
        width: double.infinity,
        height: 237.h,
        decoration: BoxDecoration(
          color: const Color(0xFFF3F3F3),
          borderRadius: BorderRadius.circular(16.84.r),
        ),
        child: Row(
          children: [
            // Left Content
            Expanded(
              child: Padding(
                padding: EdgeInsets.fromLTRB(24.w, 28.h, 16.w, 28.h),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Discount Badge
                    AppText(
                      discount ?? defaultDiscount,
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF8D8D8D),
                    ),
                    SizedBox(height: 4.h),
                    // Title
                    AppText(
                      title ?? defaultTitle,
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1A1A1A),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 8.h),
                    // Description
                    AppText(
                      description ?? defaultDescription,
                      fontSize: 12.sp,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFF8D8D8D),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 12.h),
                    // Shop Now Button
                    GestureDetector(
                      onTap: onButtonPressed,
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 24.w,
                          vertical: 12.h,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            AppText(
                              buttonText ?? defaultButtonText,
                              fontSize: 14.sp,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                            SizedBox(width: 8.w),
                            Icon(
                              Icons.arrow_forward,
                              size: 16.sp,
                              color: Colors.white,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Right Image
            Expanded(
              child: Padding(
                padding: EdgeInsets.all(16.w),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12.r),
                    image: DecorationImage(
                      image: AssetImage(imagePath ?? defaultImagePath),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
