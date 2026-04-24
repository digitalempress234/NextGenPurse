import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import 'product_card.dart';

class TopSellingProductsSection extends StatelessWidget {
  final List<Product>? products;

  const TopSellingProductsSection({super.key, this.products});

  static List<Product> get _defaultProducts => [
    Product(
      id: '1',
      name: 'All star sneakers',
      image: 'assets/images/jacket.jpg',
      originalPrice: 80000,
      currentPrice: 40000,
      discount: 50,
      rating: 4,
      reviews: 100,
    ),
    Product(
      id: '2',
      name: 'Jean jacket',
      image: 'assets/images/iphone.jpg',
      originalPrice: 80000,
      currentPrice: 40000,
      discount: 50,
      rating: 4,
      reviews: 200,
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
          AppText(
            'Top selling products',
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A1A),
          ),
          SizedBox(height: 12.h),
          Row(
            children: List.generate(displayProducts.length, (index) {
              final product = displayProducts[index];
              return Flexible(
                flex: 1,
                child: Padding(
                  padding: EdgeInsets.only(right: index == 0 ? 12.w : 0),
                  child: ProductCard(
                    imagePath: product.image,
                    productName: product.name,
                    currentPrice: '₦${product.currentPrice.toString()}',
                    originalPrice: '₦${product.originalPrice.toString()}',
                    discountPercent: '${product.discount}% Off',
                    rating: product.rating.toDouble(),
                    reviewCount: product.reviews,
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}

class Product {
  final String id;
  final String name;
  final String image;
  final int originalPrice;
  final int currentPrice;
  final int discount;
  final int rating;
  final int reviews;

  Product({
    required this.id,
    required this.name,
    required this.image,
    required this.originalPrice,
    required this.currentPrice,
    required this.discount,
    required this.rating,
    required this.reviews,
  });
}
