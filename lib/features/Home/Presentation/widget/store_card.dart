import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';

class StoreCard extends StatelessWidget {
  final String imagePath;
  final String storeName;
  final String productCount;
  final String openingHours;
  final double rating;
  final int reviewCount;
  final VoidCallback? onTap;

  const StoreCard({
    super.key,
    required this.imagePath,
    required this.storeName,
    required this.productCount,
    required this.openingHours,
    this.rating = 0,
    this.reviewCount = 0,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Store Image
          Container(
            width: double.infinity,
            height: 160.h,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12.r),
              image: DecorationImage(
                image: AssetImage(imagePath),
                fit: BoxFit.cover,
              ),
            ),
          ),
          SizedBox(height: 12.h),
          // Store Name
          AppText(
            storeName,
            fontSize: 14.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A1A),
          ),
          SizedBox(height: 4.h),
          // Product Count
          AppText(
            productCount,
            fontSize: 12.sp,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF8D8D8D),
          ),
          SizedBox(height: 4.h),
          // Opening Hours
          AppText(
            openingHours,
            fontSize: 12.sp,
            fontWeight: FontWeight.w400,
            color: const Color(0xFF8D8D8D),
          ),
          SizedBox(height: 8.h),
          // Rating
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              ...List.generate(5, (index) {
                return Padding(
                  padding: EdgeInsets.only(right: 2.w),
                  child: Icon(
                    index < rating.toInt() ? Icons.star : Icons.star_border,
                    size: 14.sp,
                    color: const Color(0xFFFF7F34),
                  ),
                );
              }),
              SizedBox(width: 4.w),
              AppText(
                '($reviewCount)',
                fontSize: 11.sp,
                fontWeight: FontWeight.w400,
                color: const Color(0xFF8D8D8D),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
