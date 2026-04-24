import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../../core/widgets/search_bar.dart';
import '../widget/banner_carousel.dart';
import '../widget/daily_discounts_section.dart';
import '../widget/deals_for_you_section.dart';
import '../widget/most_purchased_section.dart';
import '../widget/categories_section.dart';
import '../widget/top_selling_products_section.dart';
import '../widget/popular_stores_section.dart';
import '../widget/recommended_products_section.dart';
import '../widget/promotional_banner_section.dart';
import '../widget/image_search_modal.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../search/presentation/search_result_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    return SafeArea(
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
            // Shop by Category Section
            _buildShopByCategorySection(),
            SizedBox(height: 24.h),
            // Categories Section
            _buildCategoriesSection(),
            SizedBox(height: 24.h),
            // Top Selling Products Section
            _buildTopSellingProductsSection(),
            SizedBox(height: 24.h),
            // Popular Stores Section
            _buildPopularStoresSection(),
            SizedBox(height: 24.h),
            // Recommended Products Section
            _buildRecommendedProductsSection(),
            SizedBox(height: 24.h),
            // Promotional Banner Section
            _buildPromotionalBannerSection(),
            SizedBox(height: 24.h),
          ],
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
          // Handle search query change if needed
        },
        onSearchSubmitted: (query) {
          if (query.isNotEmpty) {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => SearchResultScreen(searchQuery: query),
              ),
            );
          }
        },
        onScanPressed: () {
          _showImageSearchModal();
        },
        onFilterPressed: () {
          // TODO: Navigate to filter screen
        },
      ),
    );
  }

  /// Show image search modal with dimmed background
  void _showImageSearchModal() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return ImageSearchModal(
          onClose: () => Navigator.pop(context),
          onImageSelected: () {
            // TODO: Handle image selection
            Navigator.pop(context);
          },
        );
      },
      barrierColor: Colors.black.withOpacity(0.4),
      barrierDismissible: true,
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
    return const DailyDiscountsSection();
  }

  /// Build most purchased section
  Widget _buildShopByCategorySection() {
    return const MostPurchasedSection();
  }

  /// Build categories section
  Widget _buildCategoriesSection() {
    return const CategoriesSection();
  }

  /// Build deals for you section
  Widget _buildDealsForYouSection() {
    return DealsForYouSection(
      onShopPressed: () {
        // TODO: Navigate to deals section
      },
    );
  }

  /// Build top selling products section
  Widget _buildTopSellingProductsSection() {
    return const TopSellingProductsSection();
  }

  /// Build popular stores section
  Widget _buildPopularStoresSection() {
    return const PopularStoresSection();
  }

  /// Build recommended products section
  Widget _buildRecommendedProductsSection() {
    return const RecommendedProductsSection();
  }

  /// Build promotional banner section
  Widget _buildPromotionalBannerSection() {
    return PromotionalBannerSection(
      onButtonPressed: () {
        // TODO: Navigate to products
      },
    );
  }
}
