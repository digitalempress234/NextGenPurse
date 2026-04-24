import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';
import 'product_card.dart';
import 'daily_discounts_section.dart';

class DealsForYouSection extends StatelessWidget {
  /// List of products to display
  final List<ProductDiscountData>? products;

  /// Section title
  final String title;

  /// Section subtitle
  final String subtitle;

  /// Shop button text
  final String buttonText;

  /// Callback when shop button is pressed
  final VoidCallback? onShopPressed;

  const DealsForYouSection({
    super.key,
    this.products,
    this.title = 'Deals made just for you',
    this.subtitle =
        'Based on your history and what is currently trending on our store',
    this.buttonText = 'Shop Now',
    this.onShopPressed,
  });

  /// Get default mock products
  static List<ProductDiscountData> get _defaultProducts => [
    ProductDiscountData(
      imagePath: 'assets/images/laptop.jpg',
      productName: 'Premium Laptop',
      currentPrice: '₦ 150,000',
      originalPrice: '₦ 300,000',
      discountPercent: '50% Off',
      rating: 4,
      reviewCount: 150,
      onAddToCart: () {},
      onWishlistPressed: () {},
    ),
    ProductDiscountData(
      imagePath: 'assets/images/laptop2.jpg',
      productName: 'Gaming Laptop',
      currentPrice: '₦ 200,000',
      originalPrice: '₦ 400,000',
      discountPercent: '50% Off',
      rating: 5,
      reviewCount: 280,
      onAddToCart: () {},
      onWishlistPressed: () {},
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final displayProducts = products ?? _defaultProducts;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.r),
          color: const Color(0xFFF3F3F3),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Title
              AppText(
                title,
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              SizedBox(height: 8.h),
              // Subtitle
              AppText(
                subtitle,
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
                color: AppColors.textSecondary,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 16.h),
              // Shop Button
              GestureDetector(
                onTap: onShopPressed,
                child: Container(
                  width: 118.w,
                  height: 38.h,
                  padding: EdgeInsets.all(10.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF7F34),
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: Center(
                    child: AppText(
                      buttonText,
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              SizedBox(height: 20.h),
              // Products Grid (2 columns)
              Row(
                children: List.generate(
                  displayProducts.length * 2 - 1,
                  (index) => index.isEven
                      ? Flexible(
                          flex: 1,
                          child: ProductCard(
                            imagePath: displayProducts[index ~/ 2].imagePath,
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
                            onWishlistPressed:
                                displayProducts[index ~/ 2].onWishlistPressed,
                          ),
                        )
                      : SizedBox(width: 12.w),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
