import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/widgets/search_bar.dart';
import '../widget/banner_carousel.dart';
import '../widget/daily_discounts_section.dart';
import '../widget/deals_for_you_section.dart';
import '../../../../core/constants/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // App Bar
              _buildAppBar(),
              // TODO: Add Search Bar Section
              _buildSearchSection(),
              SizedBox(height: 24.h),
              // TODO: Add Banner Section
              _buildBannerSection(),
              SizedBox(height: 24.h),
              // Daily Discounts Section
              _buildDailyDiscountsSection(),
              SizedBox(height: 24.h),
              // Deals for You Section
              _buildDealsForYouSection(),
              SizedBox(height: 24.h),
            ],
          ),
        ),
      ),
    );
  }

  /// Build app bar
  Widget _buildAppBar() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: Row(
        children: [
          // Profile Section
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Profile Avatar
                Row(
                  children: [
                    CircleAvatar(
                      radius: 28.r,
                      backgroundImage: AssetImage('assets/icons/profile.png'),
                      backgroundColor: const Color(0xFFF0F0F0),
                    ),
                    SizedBox(width: 12.w),
                    // Greeting and Subtitle
                    Expanded(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Hello, Ashraf',
                            style: TextStyle(
                              fontSize: 16.sp,
                              fontWeight: FontWeight.w600,
                              color: const Color(0xFF1A1A1A),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: 4.h),
                          Text(
                            "Let's do a lot today",
                            style: TextStyle(
                              fontSize: 12.sp,
                              fontWeight: FontWeight.w500,
                              color: const Color(0xFF8D8D8D),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          SizedBox(width: 16.w),
          // Action Icons
          GestureDetector(
            onTap: () => context.push('/cart'),
            child: Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE5E5E5), width: 1),
              ),
              child: Center(
                child: SvgPicture.asset(
                  'assets/icons/cart.svg',
                  width: 20.w,
                  height: 20.w,
                  colorFilter: const ColorFilter.mode(
                    Color(0xFF1A1A1A),
                    BlendMode.srcIn,
                  ),
                ),
              ),
            ),
          ),
          SizedBox(width: 12.w),
          GestureDetector(
            onTap: () => context.push('/orders'),
            child: Container(
              width: 40.w,
              height: 40.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: Colors.white,
                border: Border.all(color: const Color(0xFFE5E5E5), width: 1),
              ),
              child: Center(
                child: SvgPicture.asset(
                  'assets/icons/orders.svg',
                  width: 20.w,
                  height: 20.w,
                  colorFilter: const ColorFilter.mode(
                    Color(0xFF1A1A1A),
                    BlendMode.srcIn,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Build search bar section
  Widget _buildSearchSection() {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
      child: ProductSearchBar(
        hintText: 'Search for products',
        onSearchChanged: (query) {
          // TODO: Handle search query change
        },
        onScanPressed: () {
          // TODO: Handle scan action
        },
        onFilterPressed: () {
          // TODO: Navigate to filter screen
        },
      ),
    );
  }

  /// Build banner/carousel section
  Widget _buildBannerSection() {
    final banners = [
      BannerData(
        subtitle: 'Best Deal Online on smart watches',
        title: 'SMART WEARABLE.',
        dealText: 'UP to 80% OFF',
        buttonText: 'Shop Now',
        imagePath: 'assets/images/watch.png',
        backgroundColor: const Color(0xFF633186),
        onButtonPressed: () {
          context.push('/products?category=wearables');
        },
      ),
      BannerData(
        subtitle: 'New Collection Available',
        title: 'Summer Fashion.',
        dealText: 'UP to 50% OFF',
        buttonText: 'Explore',
        imagePath: 'assets/images/watch.png',
        backgroundColor: AppColors.primary,
        onButtonPressed: () {
          context.push('/products?category=fashion');
        },
      ),
      BannerData(
        subtitle: 'Limited Time Offer',
        title: 'Premium Gadgets.',
        dealText: 'UP to 60% OFF',
        buttonText: 'View',
        imagePath: 'assets/images/watch.png',
        backgroundColor: const Color(0xFF4A3C7C),
        onButtonPressed: () {
          context.push('/products?category=gadgets');
        },
      ),
    ];

    return BannerCarousel(
      banners: banners,
      autoScroll: true,
      autoScrollDuration: const Duration(seconds: 5),
    );
  }

  /// Build daily discounts section
  Widget _buildDailyDiscountsSection() {
    final products = [
      ProductDiscountData(
        imagePath: 'assets/images/watch.png',
        productName: 'Oraimo smart-watch',
        currentPrice: '₦ 40,000',
        originalPrice: '₦ 80,000',
        discountPercent: '50% Off',
        rating: 4,
        reviewCount: 100,
        onAddToCart: () {
          // TODO: Add to cart
        },
        onWishlistPressed: () {
          // TODO: Add to wishlist
        },
      ),
      ProductDiscountData(
        imagePath: 'assets/images/watch.png',
        productName: 'Airpods 3pro',
        currentPrice: '₦ 40,000',
        originalPrice: '₦ 80,000',
        discountPercent: '50% Off',
        rating: 4,
        reviewCount: 200,
        onAddToCart: () {
          // TODO: Add to cart
        },
        onWishlistPressed: () {
          // TODO: Add to wishlist
        },
      ),
    ];

    return DailyDiscountsSection(
      products: products,
      title: 'Daily Discounts',
      bannerText: '3 items and get 20% Discount',
      iconPath: 'assets/icons/solar_shop-bold.svg',
    );
  }

  /// Build deals for you section
  Widget _buildDealsForYouSection() {
    final products = [
      ProductDiscountData(
        imagePath: 'assets/images/watch.png',
        productName: 'Oraimo smart-watch',
        currentPrice: '₦ 40,000',
        originalPrice: '₦ 80,000',
        discountPercent: '50% Off',
        rating: 4,
        reviewCount: 100,
        onAddToCart: () {
          // TODO: Add to cart
        },
        onWishlistPressed: () {
          // TODO: Add to wishlist
        },
      ),
      ProductDiscountData(
        imagePath: 'assets/images/watch.png',
        productName: 'Airpods 3pro',
        currentPrice: '₦ 40,000',
        originalPrice: '₦ 80,000',
        discountPercent: '50% Off',
        rating: 5,
        reviewCount: 200,
        onAddToCart: () {
          // TODO: Add to cart
        },
        onWishlistPressed: () {
          // TODO: Add to wishlist
        },
      ),
    ];

    return DealsForYouSection(
      products: products,
      title: 'Deals made just for you',
      subtitle:
          'Based on your history and what is currently trending on our store',
      buttonText: 'Shop Now',
      onShopPressed: () {
        // TODO: Navigate to deals section
      },
    );
  }
}
