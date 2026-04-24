import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';

class CategoryCard {
  final String imagePath;
  final String label;
  final VoidCallback? onTap;

  CategoryCard({required this.imagePath, required this.label, this.onTap});
}

class CategoriesSection extends StatelessWidget {
  final List<CategoryCard>? categories;

  const CategoriesSection({super.key, this.categories});

  static List<CategoryCard> get _defaultCategories => [
    CategoryCard(
      imagePath: 'assets/images/office.jpg',
      label: 'Office equipment',
    ),
    CategoryCard(
      imagePath: 'assets/images/time.jpg',
      label: 'Jewelry and watches',
    ),
    CategoryCard(
      imagePath: 'assets/images/laptop.jpg',
      label: 'Phones and Gadgets',
    ),
    CategoryCard(
      imagePath: 'assets/images/fashion.jpg',
      label: 'Fashion and wears',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final displayCategories = categories ?? _defaultCategories;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: GridView.count(
        crossAxisCount: 2,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        mainAxisSpacing: 12.h,
        crossAxisSpacing: 12.w,
        childAspectRatio: 1.0,
        children: List.generate(displayCategories.length, (index) {
          final category = displayCategories[index];
          return GestureDetector(
            onTap: category.onTap,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12.r),
                image: DecorationImage(
                  image: AssetImage(category.imagePath),
                  fit: BoxFit.cover,
                ),
              ),
              child: Stack(
                children: [
                  // Dark overlay
                  Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.r),
                      color: Colors.black.withOpacity(0.2),
                    ),
                  ),
                  // Label with glassmorphism effect
                  Align(
                    alignment: Alignment.bottomCenter,
                    child: Padding(
                      padding: EdgeInsets.only(bottom: 12.h),
                      child: Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 10.w,
                          vertical: 6.h,
                        ),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(15.85.r),
                          color: Colors.white.withOpacity(0.5),
                        ),
                        child: AppText(
                          category.label,
                          fontSize: 11.sp,
                          fontWeight: FontWeight.w600,
                          color: Colors.black,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        }),
      ),
    );
  }
}
