import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widget/category_item.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  int _selectedIndex = 1;

  static const List<CategoryItem> categories = [
    CategoryItem(
      title: 'Appliances',
      subcategories: [
        'Microwaves',
        'Refrigerators',
        'Washing Machines',
        'Blenders',
      ],
    ),
    CategoryItem(
      title: 'Phones and Tablets',
      subcategories: [
        'Smart phones',
        'Ipad',
        'Android Tablets',
        'Adapters',
        'Chargers',
        'Battery',
        'Smart watches',
      ],
    ),
    CategoryItem(
      title: 'Electronics',
      subcategories: ['TVs', 'Audio', 'Cameras', 'Headphones'],
    ),
    CategoryItem(
      title: 'Fashion',
      subcategories: ['Men', 'Women', 'Kids', 'Accessories'],
    ),
    CategoryItem(
      title: 'Computing',
      subcategories: ['Laptops', 'Desktops', 'Peripherals', 'Software'],
    ),
    CategoryItem(
      title: 'Baby products',
      subcategories: ['Toys', 'Clothing', 'Diapers', 'Wipes'],
    ),
    CategoryItem(
      title: 'Gaming',
      subcategories: ['Consoles', 'Games', 'Accessories', 'Gaming PC'],
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        automaticallyImplyLeading: false,
        leading: GestureDetector(
          onTap: () => Navigator.pop(context),
          child: Icon(
            Icons.arrow_back,
            size: 24.sp,
            color: const Color(0xFF1A1A1A),
          ),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Image.asset(
              'assets/splascreen/IMG-20240817-WA0009 1.png',
              width: 32.h,
              height: 32.h,
            ),
            SizedBox(width: 8.w),
            Text(
              'Superstore',
              style: TextStyle(
                fontSize: 20.sp,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A1A),
                fontFamily: 'Inter',
              ),
            ),
          ],
        ),
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.only(left: 16.w, top: 16.h, bottom: 24.h),
            child: Text(
              'Categories',
              style: TextStyle(
                fontSize: 22.sp,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF1A1A1A),
                fontFamily: 'Inter',
              ),
            ),
          ),
          Expanded(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Left Column: Categories
                SizedBox(
                  width: 170.w,
                  child: ListView.builder(
                    itemCount: categories.length,
                    itemBuilder: (context, index) {
                      final bool isSelected = _selectedIndex == index;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedIndex = index;
                          });
                        },
                        child: Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 16.w,
                            vertical: 12.h,
                          ),
                          margin: EdgeInsets.only(
                            left: 16.w,
                            right: 8.w,
                            bottom: 8.h,
                          ),
                          decoration: BoxDecoration(
                            color: isSelected
                                ? const Color(0xFFF3F3F3)
                                : Colors.transparent,
                            borderRadius: BorderRadius.circular(8.r),
                          ),
                          child: Text(
                            categories[index].title,
                            style: TextStyle(
                              fontSize: 15.sp,
                              fontWeight: isSelected
                                  ? FontWeight.w500
                                  : FontWeight.w400,
                              color: const Color(0xFF1A1A1A),
                              fontFamily: 'Inter',
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                // Right Column: Subcategories
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.only(left: 16.w, right: 16.w),
                    itemCount: categories[_selectedIndex].subcategories.length,
                    itemBuilder: (context, index) {
                      return Padding(
                        padding: EdgeInsets.only(bottom: 24.h),
                        child: Text(
                          categories[_selectedIndex].subcategories[index],
                          style: TextStyle(
                            fontSize: 15.sp,
                            fontWeight: FontWeight.w400,
                            color: const Color(0xFF1A1A1A),
                            fontFamily: 'Inter',
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
