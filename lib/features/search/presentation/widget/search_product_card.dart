import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class SearchProductCard extends StatefulWidget {
  final String imagePath;
  final String productName;
  final String currentPrice;
  final String? originalPrice;
  final String? discountPercent;
  final double rating;
  final int reviewCount;
  final String supplierName;
  final String deliveryTime;
  final VoidCallback? onAddToCart;
  final VoidCallback? onWishlistPressed;
  final ValueChanged<bool>? onCompareChanged;
  final bool isWishlisted;
  final bool isCompared;

  const SearchProductCard({
    super.key,
    required this.imagePath,
    required this.productName,
    required this.currentPrice,
    this.originalPrice,
    this.discountPercent,
    this.rating = 0,
    this.reviewCount = 0,
    required this.supplierName,
    required this.deliveryTime,
    this.onAddToCart,
    this.onWishlistPressed,
    this.onCompareChanged,
    this.isWishlisted = false,
    this.isCompared = false,
  });

  @override
  State<SearchProductCard> createState() => _SearchProductCardState();
}

class _SearchProductCardState extends State<SearchProductCard> {
  late bool _isWishlisted;
  late bool _isCompared;

  @override
  void initState() {
    super.initState();
    _isWishlisted = widget.isWishlisted;
    _isCompared = widget.isCompared;
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Image Section with Badges
        Container(
          width: double.infinity,
          height: 180.h,
          decoration: BoxDecoration(
            color: const Color(0xFFF5F5F5), // Light grey background
            borderRadius: BorderRadius.circular(12.r),
            image: DecorationImage(
              image: AssetImage(widget.imagePath),
              fit: BoxFit.cover,
            ),
          ),
          child: Stack(
            children: [
              // Compare Badge (Top Left)
              Positioned(
                top: 10.h,
                left: 10.w,
                child: GestureDetector(
                  onTap: () {
                    setState(() {
                      _isCompared = !_isCompared;
                    });
                    widget.onCompareChanged?.call(_isCompared);
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(
                      horizontal: 8.w,
                      vertical: 6.h,
                    ),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFF7F34), // Orange Primary
                      borderRadius: BorderRadius.circular(6.r),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 14.w,
                          height: 14.w,
                          decoration: BoxDecoration(
                            border: Border.all(color: Colors.white, width: 1.5),
                            borderRadius: BorderRadius.circular(3.r),
                            color: _isCompared
                                ? Colors.white
                                : Colors.transparent,
                          ),
                          child: _isCompared
                              ? Icon(
                                  Icons.check,
                                  size: 10.sp,
                                  color: const Color(0xFFFF7F34),
                                )
                              : null,
                        ),
                        SizedBox(width: 6.w),
                        Text(
                          'Compare',
                          style: TextStyle(
                            fontSize: 12.sp,
                            color: Colors.white,
                            fontWeight: FontWeight.w500,
                            fontFamily: 'Inter',
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              // Wishlist Button (Top Right)
              Positioned(
                top: 10.h,
                right: 10.w,
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
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Icon(
                        _isWishlisted
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: _isWishlisted
                            ? Colors.red
                            : const Color(0xFF1A1A1A),
                        size: 18.sp,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 12.h),
        // Product Name
        Text(
          widget.productName,
          style: TextStyle(
            fontSize: 16.sp,
            fontWeight: FontWeight.w500,
            color: const Color(0xFF1A1A1A),
            fontFamily: 'Inter',
          ),
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
        ),
        SizedBox(height: 4.h),
        // Current Price
        Text(
          widget.currentPrice,
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w700,
            color: const Color(0xFF1A1A1A),
            fontFamily: 'Inter',
          ),
        ),
        SizedBox(height: 4.h),
        // Original Price, Discount, and Cart Icon Row
        Row(
          children: [
            if (widget.originalPrice != null)
              Text(
                widget.originalPrice!,
                style: TextStyle(
                  fontSize: 14.sp,
                  color: const Color(0xFF666666),
                  decoration: TextDecoration.lineThrough,
                  fontFamily: 'Inter',
                ),
              ),
            if (widget.discountPercent != null) ...[
              SizedBox(width: 8.w),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 4.h),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A1A1A), // Dark Badges
                  borderRadius: BorderRadius.circular(
                    12.r,
                  ), // Fully rounded edge
                ),
                child: Text(
                  widget.discountPercent!,
                  style: TextStyle(
                    fontSize: 11.sp,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ],
            const Spacer(),
            // Cart Button
            GestureDetector(
              onTap: widget.onAddToCart,
              child: Container(
                width: 32.w,
                height: 32.w,
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFE5E5E5)),
                ),
                child: Center(
                  child: Icon(
                    Icons.shopping_cart_outlined,
                    size: 16.sp,
                    color: const Color(0xFF1A1A1A),
                  ),
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 4.h),
        // Rating Row
        Row(
          children: [
            Row(
              children: List.generate(5, (index) {
                return Icon(
                  index < widget.rating.toInt()
                      ? Icons.star_rounded
                      : Icons.star_outline_rounded,
                  color: const Color(0xFFFF7F34), // Orange Stars
                  size: 18.sp,
                );
              }),
            ),
            SizedBox(width: 6.w),
            Text(
              '(${widget.reviewCount})',
              style: TextStyle(
                fontSize: 13.sp,
                color: const Color(0xFF666666),
                fontFamily: 'Inter',
              ),
            ),
          ],
        ),
        SizedBox(height: 8.h),
        // Supplier Name
        GestureDetector(
          onTap: () {
            // Action to navigate to Supplier/Store
          },
          child: Text(
            widget.supplierName,
            style: TextStyle(
              fontSize: 14.sp,
              color: const Color(0xFFFF7F34), // Orange Text
              decoration: TextDecoration.underline,
              decorationColor: const Color(0xFFFF7F34),
              fontWeight: FontWeight.w400,
              fontFamily: 'Inter',
            ),
          ),
        ),
        SizedBox(height: 4.h),
        // Delivery Info
        Text(
          widget.deliveryTime,
          style: TextStyle(
            fontSize: 14.sp,
            color: const Color(0xFF1A1A1A), // Black Text
            fontWeight: FontWeight.w400,
            fontFamily: 'Inter',
          ),
        ),
      ],
    );
  }
}
