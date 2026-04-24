import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../constants/app_colors.dart';
import '../providers/navigation_provider.dart';

class AppBottomNavigationBar extends ConsumerWidget {
  const AppBottomNavigationBar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(navigationIndexProvider);

    const primaryColor = Color(0xFFFF7F34); // Primary color
    const unselectedColor = Color(0xFF8D8D8D); // Unselected color

    final navigationItems = [
      {'label': 'Home', 'icon': 'assets/icons/home.svg'},
      {'label': 'Categories', 'icon': 'assets/icons/category.svg'},
      {'label': 'Scan me', 'icon': 'assets/icons/scan.svg'},
      {'label': 'Watchlist', 'icon': 'assets/icons/watchlist.svg'},
      {'label': 'More', 'icon': 'assets/icons/more.svg'},
    ];

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            offset: const Offset(0, -2),
            blurRadius: 8,
            color: const Color(0xFF000000).withOpacity(0.07),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: SizedBox(
          height: 68.h,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(navigationItems.length, (index) {
              final item = navigationItems[index];
              final isSelected = selectedIndex == index;
              final itemColor = isSelected ? primaryColor : unselectedColor;

              return GestureDetector(
                onTap: () {
                  ref.read(navigationIndexProvider.notifier).state = index;
                },
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SvgPicture.asset(
                      item['icon'] as String,
                      width: 24.w,
                      height: 24.h,
                      colorFilter: ColorFilter.mode(itemColor, BlendMode.srcIn),
                    ),
                    SizedBox(height: 4.h),
                    Text(
                      item['label'] as String,
                      style: TextStyle(
                        fontSize: 12.sp,
                        fontWeight: FontWeight.w500,
                        color: itemColor,
                      ),
                    ),
                  ],
                ),
              );
            }),
          ),
        ),
      ),
    );
  }
}
