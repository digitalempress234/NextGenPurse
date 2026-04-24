import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../../core/widgets/search_bar.dart';
import 'widget/search_product_card.dart';
import 'widget/filter_drawer.dart';

class SearchResultScreen extends StatefulWidget {
  final String searchQuery;

  const SearchResultScreen({super.key, this.searchQuery = 'Watches'});

  @override
  State<SearchResultScreen> createState() => _SearchResultScreenState();
}

class _SearchResultScreenState extends State<SearchResultScreen> {
  late TextEditingController _searchController;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  @override
  void initState() {
    super.initState();
    _searchController = TextEditingController(text: widget.searchQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      endDrawer:
          const FilterDrawer(), // Use endDrawer so it slides from right as visual cue. Use `drawer:` instead if you explicitly want left.
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Icon(
            Icons.arrow_back,
            color: const Color(0xFF1A1A1A),
            size: 24.sp,
          ),
        ),
        title: Text(
          'Search',
          style: TextStyle(
            fontSize: 18.sp,
            fontWeight: FontWeight.w600,
            color: const Color(0xFF1A1A1A),
            fontFamily: 'Inter',
          ),
        ),
        actions: [
          GestureDetector(
            onTap: () {},
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
            onTap: () {},
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
          SizedBox(width: 20.w),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.symmetric(horizontal: 16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(height: 16.h),
            // The existing search bar widget
            ProductSearchBar(
              controller: _searchController,
              hintText: 'Search for products',
              onSearchSubmitted: (query) {
                setState(() {
                  // The UI will rebuild with the new search term
                });
              },
              onFilterPressed: () {
                _scaffoldKey.currentState?.openEndDrawer();
              },
            ),
            SizedBox(height: 32.h),
            Text(
              'Result for ${_searchController.text.toLowerCase()}',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A1A),
                fontFamily: 'Inter',
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              '200,016 Products found from\ndifferent suppliers',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w400,
                color: const Color(0xFF666666),
                height: 1.4,
                fontFamily: 'Inter',
              ),
            ),
            SizedBox(height: 24.h),
            // Active Filter Row
            Row(
              children: [
                Text(
                  'Active Filter',
                  style: TextStyle(
                    fontSize: 13.sp,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF1A1A1A),
                    fontFamily: 'Inter',
                  ),
                ),
                SizedBox(width: 12.w),
                Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: 12.w,
                    vertical: 8.h,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFF7F34), // Primary Orange
                    borderRadius: BorderRadius.circular(6.r),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Price: N 40,000 - N 80,000',
                        style: TextStyle(
                          fontSize: 12.sp,
                          fontWeight: FontWeight.w400,
                          color: Colors.white,
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(width: 8.w),
                      Icon(Icons.close, size: 14.sp, color: Colors.white),
                    ],
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () {
                    // Implement Clear All
                  },
                  child: Text(
                    'Clear All',
                    style: TextStyle(
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFFFF7F34), // Primary Orange
                      decoration: TextDecoration.underline,
                      decorationColor: const Color(0xFFFF7F34),
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 24.h),
            // Products Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 8,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 16.w,
                mainAxisSpacing: 32.h,
                childAspectRatio:
                    0.44, // Adjusted width-to-height ratio for vertical cards
              ),
              itemBuilder: (context, index) {
                // Using various fallback asset images already in your project history
                final imagePaths = [
                  'assets/images/oraimo.jpg',
                  'assets/images/airpods.jpg',
                  'assets/images/phone.jpg',
                  'assets/images/jacket.jpg',
                  'assets/images/office.jpg',
                  'assets/images/time.jpg',
                  'assets/images/laptop.jpg',
                  'assets/images/iphone.jpg',
                ];

                return SearchProductCard(
                  // Modulo prevents out-of-bounds errors if the list size doesn't perfectly match
                  imagePath: imagePaths[index % imagePaths.length],
                  productName: 'All star sneakers',
                  currentPrice: 'N 40,000',
                  originalPrice: 'N 80,000',
                  discountPercent: '50% Off',
                  rating: 4.0,
                  reviewCount: 100,
                  supplierName: 'Microsoft Cooperation',
                  deliveryTime: 'Delivery within 3 days',
                );
              },
            ),
            SizedBox(height: 32.h),
            // Pagination
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: () {},
                  child: Icon(
                    Icons.arrow_back,
                    color: const Color(0xFF1A1A1A),
                    size: 24.sp,
                  ),
                ),
                SizedBox(width: 16.w),
                // Page 1 (Active)
                Container(
                  width: 36.w,
                  height: 36.w,
                  decoration: const BoxDecoration(
                    color: Color(0xFFFF7F34), // Orange Primary
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '1',
                      style: TextStyle(
                        fontSize: 14.sp,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                        fontFamily: 'Inter',
                      ),
                    ),
                  ),
                ),
                SizedBox(width: 16.w),
                // Page 2
                GestureDetector(
                  onTap: () {},
                  child: Text(
                    '2',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF1A1A1A),
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
                SizedBox(width: 20.w),
                // Page 3
                GestureDetector(
                  onTap: () {},
                  child: Text(
                    '3',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF1A1A1A),
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
                SizedBox(width: 20.w),
                // Ellipsis
                Text(
                  '......',
                  style: TextStyle(
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w500,
                    color: const Color(0xFF1A1A1A),
                    letterSpacing: 2,
                    fontFamily: 'Inter',
                  ),
                ),
                SizedBox(width: 20.w),
                // Page 10
                GestureDetector(
                  onTap: () {},
                  child: Text(
                    '10',
                    style: TextStyle(
                      fontSize: 16.sp,
                      fontWeight: FontWeight.w500,
                      color: const Color(0xFF1A1A1A),
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
                SizedBox(width: 16.w),
                GestureDetector(
                  onTap: () {},
                  child: Icon(
                    Icons.arrow_forward,
                    color: const Color(0xFF1A1A1A),
                    size: 24.sp,
                  ),
                ),
              ],
            ),
            SizedBox(height: 100.h),
          ],
        ),
      ),
    );
  }
}
