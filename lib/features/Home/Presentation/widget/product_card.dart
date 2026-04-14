import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';

class ProductCard extends StatefulWidget {
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

  const ProductCard({
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
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
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
      height: 271.h,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10.r),
        border: Border.all(color: const Color(0xFFE0E0E0), width: 1),
      ),
      child: Stack(
        children: [
          // Main Card Content
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Product Image
              Container(
                width: 176.w,
                height: 156.h,
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
                  padding: EdgeInsets.all(12.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      // Product Name
                      AppText(
                        widget.productName,
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      // Price Section
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Current Price
                          AppText(
                            widget.currentPrice,
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                          SizedBox(height: 4.h),
                          // Original Price + Discount
                          Row(
                            children: [
                              if (widget.originalPrice != null)
                                AppText(
                                  widget.originalPrice!,
                                  fontSize: 11.sp,
                                  color: AppColors.textSecondary,
                                  decoration: TextDecoration.lineThrough,
                                ),
                              if (widget.discountPercent != null)
                                SizedBox(width: 8.w),
                              if (widget.discountPercent != null)
                                Container(
                                  padding: EdgeInsets.symmetric(
                                    horizontal: 6.w,
                                    vertical: 2.h,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black,
                                    borderRadius: BorderRadius.circular(4.r),
                                  ),
                                  child: AppText(
                                    widget.discountPercent!,
                                    fontSize: 10.sp,
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                      // Rating Section
                      Row(
                        children: [
                          Row(
                            children: List.generate(
                              5,
                              (index) => Icon(
                                index < widget.rating.toInt()
                                    ? Icons.star_rounded
                                    : Icons.star_outline_rounded,
                                color: AppColors.primary,
                                size: 14.sp,
                              ),
                            ),
                          ),
                          SizedBox(width: 4.w),
                          AppText(
                            '(${widget.reviewCount})',
                            fontSize: 10.sp,
                            color: AppColors.textSecondary,
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
                child: CircleAvatar(
                  backgroundColor: Colors.white,
                  child: GestureDetector(
                    onTap: widget.onWishlistPressed,
                    child: Icon(
                      _isWishlisted
                          ? Icons.favorite_rounded
                          : Icons.favorite_outline_rounded,
                      color: _isWishlisted ? AppColors.error : Colors.grey,
                      size: 16.sp,
                    ),
                  ),
                ),
              ),
            ),
          ),
          // Add to Cart Button (Bottom Right)
          Positioned(
            bottom: 8.w,
            right: 8.w,
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
                    color: AppColors.textPrimary,
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
