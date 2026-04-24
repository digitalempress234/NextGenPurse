import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';

class RecommendedProductCard extends StatefulWidget {
  /// Product image path
  final String imagePath;

  /// Product name
  final String productName;

  /// Current price
  final String currentPrice;

  /// Original price (with strikethrough)
  final String? originalPrice;

  /// Discount percentage
  final String? discountPercent;

  /// Star rating (0-5)
  final double rating;

  /// Number of reviews
  final int reviewCount;

  /// Callback when add to cart is pressed
  final VoidCallback? onAddToCart;

  /// Callback when wishlist is pressed
  final VoidCallback? onWishlistPressed;

  /// Is product in wishlist
  final bool isWishlisted;

  const RecommendedProductCard({
    super.key,
    required this.imagePath,
    required this.productName,
    required this.currentPrice,
    this.originalPrice,
    this.discountPercent,
    this.rating = 0,
    this.reviewCount = 0,
    this.onAddToCart,
    this.onWishlistPressed,
    this.isWishlisted = false,
  });

  @override
  State<RecommendedProductCard> createState() => _RecommendedProductCardState();
}

class _RecommendedProductCardState extends State<RecommendedProductCard> {
  late bool _isWishlisted;

  @override
  void initState() {
    super.initState();
    _isWishlisted = widget.isWishlisted;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 260.h,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10.r),
      ),
      child: Stack(
        children: [
          // Main Card Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Container(
                width: double.infinity,
                height: 120.h,
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(6.r),
                  image: DecorationImage(
                    image: AssetImage(widget.imagePath),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              // Product Details
              Expanded(
                child: Padding(
                  padding: EdgeInsets.all(16.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      // Product Name
                      AppText(
                        widget.productName,
                        fontSize: 13.sp,
                        fontWeight: FontWeight.w500,
                        color: const Color(0xFF1A1A1A),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 6.h),
                      // Current Price
                      AppText(
                        widget.currentPrice,
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF1A1A1A),
                      ),
                      SizedBox(height: 6.h),
                      // Price Row (Original + Discount)
                      Row(
                        children: [
                          if (widget.originalPrice != null)
                            Expanded(
                              child: AppText(
                                widget.originalPrice!,
                                fontSize: 11.sp,
                                fontWeight: FontWeight.w400,
                                color: const Color(0xFF8D8D8D),
                                decoration: TextDecoration.lineThrough,
                              ),
                            ),
                          if (widget.discountPercent != null)
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 6.w,
                                vertical: 2.h,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(0xFF1A1A1A),
                                borderRadius: BorderRadius.circular(4.r),
                              ),
                              child: AppText(
                                widget.discountPercent!,
                                fontSize: 10.sp,
                                fontWeight: FontWeight.w600,
                                color: Colors.white,
                              ),
                            ),
                        ],
                      ),
                      SizedBox(height: 6.h),
                      // Rating
                      Row(
                        children: [
                          ...List.generate(5, (index) {
                            return Padding(
                              padding: EdgeInsets.only(right: 2.w),
                              child: Icon(
                                index < widget.rating.toInt()
                                    ? Icons.star
                                    : Icons.star_border,
                                size: 12.sp,
                                color: AppColors.primary,
                              ),
                            );
                          }),
                          SizedBox(width: 4.w),
                          AppText(
                            '(${widget.reviewCount})',
                            fontSize: 10.sp,
                            fontWeight: FontWeight.w400,
                            color: const Color(0xFF8D8D8D),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          // Wishlist Button (Top Right)
          Positioned(
            top: 8.w,
            right: 8.w,
            child: GestureDetector(
              onTap: () {
                setState(() {
                  _isWishlisted = !_isWishlisted;
                });
                widget.onWishlistPressed?.call();
              },
              child: Container(
                width: 32.w,
                height: 32.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.08),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Center(
                  child: Icon(
                    _isWishlisted ? Icons.favorite : Icons.favorite_border,
                    size: 16.sp,
                    color: _isWishlisted
                        ? AppColors.primary
                        : const Color(0xFF8D8D8D),
                  ),
                ),
              ),
            ),
          ),
          // Add to Cart Button (Bottom Right)
          Positioned(
            bottom: 80.w,
            right: 16.w,
            child: GestureDetector(
              onTap: widget.onAddToCart,
              child: Container(
                width: 32.w,
                height: 32.w,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white,
                  border: Border.all(color: const Color(0xFFE5E5E5), width: 1),
                ),
                child: Center(
                  child: Icon(
                    Icons.shopping_cart_outlined,
                    color: const Color(0xFF1A1A1A),
                    size: 16.sp,
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
