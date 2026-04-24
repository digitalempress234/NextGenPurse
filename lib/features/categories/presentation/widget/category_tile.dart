import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import 'category_item.dart';

class CategoryTile extends StatelessWidget {
  final CategoryItem category;

  const CategoryTile({super.key, required this.category});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Category Title
          AppText(
            category.title,
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A1A),
          ),
          SizedBox(height: 12.h),
          // Subcategories List
          Column(
            children: List.generate(
              category.subcategories.length,
              (index) => Padding(
                padding: EdgeInsets.only(bottom: 12.h),
                child: GestureDetector(
                  onTap: () {
                    // TODO: Navigate to subcategory products
                  },
                  child: AppText(
                    category.subcategories[index],
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w400,
                    color: const Color(0xFF1A1A1A),
                  ),
                ),
              ),
            ),
          ),
          SizedBox(height: 20.h),
          Divider(color: const Color(0xFFE5E5E5), height: 1),
        ],
      ),
    );
  }
}
