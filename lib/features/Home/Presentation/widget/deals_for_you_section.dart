import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';
import 'product_card.dart';
import 'daily_discounts_section.dart';

class DealsForYouSection extends StatelessWidget {
  /// List of products to display
  final List<ProductDiscountData> products;

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
    required this.products,
    this.title = 'Deals made just for you',
    this.subtitle =
        'Based on your history and what is currently trending on our store',
    this.buttonText = 'Shop Now',
    this.onShopPressed,
  });

  @override
  Widget build(BuildContext context) {
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
              ElevatedButton(
                onPressed: onShopPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: EdgeInsets.symmetric(
                    horizontal: 24.w,
                    vertical: 12.h,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                ),
                child: AppText(
                  buttonText,
                  fontSize: 14.sp,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              SizedBox(height: 20.h),
              // Products Grid (2 columns)
              Row(
                children: List.generate(
                  products.length * 2 - 1,
                  (index) => index.isEven
                      ? Flexible(
                          flex: 1,
                          child: ProductCard(
                            imagePath: products[index ~/ 2].imagePath,
                            productName: products[index ~/ 2].productName,
                            currentPrice: products[index ~/ 2].currentPrice,
                            originalPrice: products[index ~/ 2].originalPrice,
                            discountPercent:
                                products[index ~/ 2].discountPercent,
                            rating: products[index ~/ 2].rating,
                            reviewCount: products[index ~/ 2].reviewCount,
                            onAddToCart: products[index ~/ 2].onAddToCart,
                            onWishlistPressed:
                                products[index ~/ 2].onWishlistPressed,
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
