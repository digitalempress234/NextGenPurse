import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';
import 'product_card.dart';

class DailyDiscountsSection extends StatelessWidget {
  /// List of products to display
  final List<ProductDiscountData>? products;

  /// Discount title
  final String title;

  /// Discount banner text
  final String bannerText;

  /// Shop icon path
  final String iconPath;

  const DailyDiscountsSection({
    super.key,
    this.products,
    this.title = 'Daily Discounts',
    this.bannerText = '3 items and get 20% Discount',
    this.iconPath = 'assets/icons/solar_shop-bold.svg',
  });

  /// Get default mock products
  static List<ProductDiscountData> get _defaultProducts => [
    ProductDiscountData(
      imagePath: 'assets/images/oraimo.jpg',
      productName: 'Oraimo smart-watch',
      currentPrice: '₦ 40,000',
      originalPrice: '₦ 80,000',
      discountPercent: '50% Off',
      rating: 4,
      reviewCount: 100,
      onAddToCart: () {},
      onWishlistPressed: () {},
    ),
    ProductDiscountData(
      imagePath: 'assets/images/airpods.jpg',
      productName: 'Airpods 3pro',
      currentPrice: '₦ 40,000',
      originalPrice: '₦ 80,000',
      discountPercent: '50% Off',
      rating: 4,
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
      child: Container(
        width: double.infinity,
        height: 420.h,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(10.r),
          color: const Color(0xFFF3F3F3),
        ),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 10.w),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              SizedBox(height: 16.h),
              // Title
              AppText(
                title,
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: AppColors.textPrimary,
              ),
              SizedBox(height: 12.h),
              // Discount Banner
              Container(
                width: double.infinity,
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
                decoration: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12.r),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SvgPicture.asset(
                      iconPath,
                      width: 20.w,
                      height: 20.w,
                      colorFilter: const ColorFilter.mode(
                        Colors.white,
                        BlendMode.srcIn,
                      ),
                    ),
                    SizedBox(width: 8.w),
                    AppText(
                      bannerText,
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ],
                ),
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

class ProductDiscountData {
  final String imagePath;
  final String productName;
  final String currentPrice;
  final String? originalPrice;
  final String? discountPercent;
  final double rating;
  final int reviewCount;
  final VoidCallback? onAddToCart;
  final VoidCallback? onWishlistPressed;

  ProductDiscountData({
    required this.imagePath,
    required this.productName,
    required this.currentPrice,
    this.originalPrice,
    this.discountPercent,
    this.rating = 0,
    this.reviewCount = 0,
    this.onAddToCart,
    this.onWishlistPressed,
  });
}
