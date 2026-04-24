import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/widgets/app_text.dart';
import 'store_card.dart';

class StoreData {
  final String imagePath;
  final String storeName;
  final String productCount;
  final String openingHours;
  final double rating;
  final int reviewCount;
  final VoidCallback? onTap;

  StoreData({
    required this.imagePath,
    required this.storeName,
    required this.productCount,
    required this.openingHours,
    this.rating = 0,
    this.reviewCount = 0,
    this.onTap,
  });
}

class PopularStoresSection extends StatelessWidget {
  final List<StoreData>? stores;

  const PopularStoresSection({super.key, this.stores});

  static List<StoreData> get _defaultStores => [
    StoreData(
      imagePath: 'assets/images/phones_gadget.jpg',
      storeName: 'NIKE',
      productCount: '3,000 products',
      openingHours: 'Opens at 8:00AM-9:00PM',
      rating: 4,
      reviewCount: 100,
    ),
    StoreData(
      imagePath: 'assets/images/Dell.jpg',
      storeName: 'DELL',
      productCount: '3,000 products',
      openingHours: 'Opens at 8:00AM-9:00PM',
      rating: 4,
      reviewCount: 100,
    ),
    StoreData(
      imagePath: 'assets/images/apple.jpg',
      storeName: 'Apple',
      productCount: '3,000 products',
      openingHours: 'Opens at 8:00AM-9:00PM',
      rating: 4,
      reviewCount: 100,
    ),
    StoreData(
      imagePath: 'assets/images/samsung.jpg',
      storeName: 'Samsung',
      productCount: '3,000 products',
      openingHours: 'Opens at 8:00AM-9:00PM',
      rating: 4,
      reviewCount: 100,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final displayStores = stores ?? _defaultStores;

    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 16.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          AppText(
            'Popular stores',
            fontSize: 16.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A1A),
          ),
          SizedBox(height: 12.h),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 16.h,
            crossAxisSpacing: 12.w,
            childAspectRatio: 0.65,
            children: List.generate(displayStores.length, (index) {
              final store = displayStores[index];
              return StoreCard(
                imagePath: store.imagePath,
                storeName: store.storeName,
                productCount: store.productCount,
                openingHours: store.openingHours,
                rating: store.rating,
                reviewCount: store.reviewCount,
                onTap: store.onTap,
              );
            }),
          ),
        ],
      ),
    );
  }
}
