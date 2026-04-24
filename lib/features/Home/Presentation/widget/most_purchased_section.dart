import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';
import 'product_card.dart';
import 'daily_discounts_section.dart';

class MostPurchasedSection extends StatelessWidget {
  /// List of products to display
  final List<ProductDiscountData>? products;

  /// Section title
  final String title;

  /// Section subtitle
  final String subtitle;

  const MostPurchasedSection({
    super.key,
    this.products,
    this.title = 'Most purchased',
    this.subtitle = 'Shop by category',
  });

  /// Get default mock products
  static List<ProductDiscountData> get _defaultProducts => [
    ProductDiscountData(
      imagePath: 'assets/images/phone.jpg',
      productName: 'All star sneakers',
      currentPrice: '₦ 40,000',
      originalPrice: '₦ 80,000',
      discountPercent: '50% Off',
      rating: 4,
      reviewCount: 100,
      onAddToCart: () {},
      onWishlistPressed: () {},
    ),
    ProductDiscountData(
      imagePath: 'assets/images/jacket.jpg',
      productName: 'Jean jacket',
      currentPrice: '₦ 40,000',
      originalPrice: '₦ 80,000',
      discountPercent: '50% Off',
      rating: 5,
      reviewCount: 200,
      onAddToCart: () {},
      onWishlistPressed: () {},
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final displayProducts = products ?? _defaultProducts;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Department label
          AppText(
            '- Departments',
            fontSize: 12.sp,
            fontWeight: FontWeight.w500,
            color: AppColors.textSecondary,
          ),
          SizedBox(height: 8.h),
          // Title
          AppText(
            title,
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
          SizedBox(height: 12.h),
          // Most Purchased Container
          Container(
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(10.r),
              color: const Color(0xFFF3F3F3),
            ),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Subtitle
                  AppText(
                    subtitle,
                    fontSize: 12.sp,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                  SizedBox(height: 16.h),
                  // Products Grid (2 columns)
                  Row(
                    children: List.generate(
                      displayProducts.length * 2 - 1,
                      (index) => index.isEven
                          ? Flexible(
                              flex: 1,
                              child: ProductCard(
                                imagePath:
                                    displayProducts[index ~/ 2].imagePath,
                                productName:
                                    displayProducts[index ~/ 2].productName,
                                currentPrice:
                                    displayProducts[index ~/ 2].currentPrice,
                                originalPrice:
                                    displayProducts[index ~/ 2].originalPrice,
                                discountPercent:
                                    displayProducts[index ~/ 2].discountPercent,
                                rating: displayProducts[index ~/ 2].rating,
                                reviewCount:
                                    displayProducts[index ~/ 2].reviewCount,
                                onAddToCart:
                                    displayProducts[index ~/ 2].onAddToCart,
                                onWishlistPressed: displayProducts[index ~/ 2]
                                    .onWishlistPressed,
                              ),
                            )
                          : SizedBox(width: 12.w),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
