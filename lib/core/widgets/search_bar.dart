import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../constants/app_colors.dart';

class ProductSearchBar extends StatelessWidget {
  /// Hint text for search input
  final String hintText;

  /// Callback when search text changes
  final ValueChanged<String>? onSearchChanged;

  /// Callback when search is submitted
  final VoidCallback? onSearchSubmitted;

  /// Callback when scan icon is pressed
  final VoidCallback? onScanPressed;

  /// Callback when filter icon is pressed
  final VoidCallback? onFilterPressed;

  /// Search controller for programmatic access
  final TextEditingController? controller;

  const ProductSearchBar({
    super.key,
    this.hintText = 'Search for products',
    this.onSearchChanged,
    this.onSearchSubmitted,
    this.onScanPressed,
    this.onFilterPressed,
    this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 45.h,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: AppColors.border, width: 1),
        color: AppColors.surfaceLight,
      ),
      child: Row(
        children: [
          // Search Icon
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.w),
            child: SvgPicture.asset(
              'assets/icons/mynaui_search.svg',
              width: 20.w,
              height: 20.w,
              colorFilter: ColorFilter.mode(
                AppColors.textPrimary,
                BlendMode.srcIn,
              ),
            ),
          ),
          // Search Input Field
          Expanded(
            child: TextField(
              controller: controller,
              onChanged: onSearchChanged,
              onSubmitted: (_) => onSearchSubmitted?.call(),
              decoration: InputDecoration(
                hintText: hintText,
                hintStyle: TextStyle(
                  fontSize: 14.sp,
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w400,
                ),
                border: InputBorder.none,
                contentPadding: EdgeInsets.zero,
              ),
              style: TextStyle(fontSize: 14.sp, color: AppColors.textPrimary),
            ),
          ),
          // Scan Icon
          GestureDetector(
            onTap: onScanPressed,
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 12.w),
              child: SvgPicture.asset(
                'assets/icons/tdesign_scan.svg',
                width: 20.w,
                height: 20.w,
                colorFilter: ColorFilter.mode(
                  AppColors.textPrimary,
                  BlendMode.srcIn,
                ),
              ),
            ),
          ),
          // Filter Button (Orange)
          GestureDetector(
            onTap: onFilterPressed,
            child: Container(
              width: 42.w,
              height: 45.h,
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.only(
                  topRight: Radius.circular(10.r),
                  bottomRight: Radius.circular(10.r),
                ),
              ),
              child: Center(
                child: SvgPicture.asset(
                  'assets/icons/basil_filter-solid.svg',
                  width: 20.w,
                  height: 20.w,
                  colorFilter: ColorFilter.mode(
                    AppColors.textWhite,
                    BlendMode.srcIn,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
