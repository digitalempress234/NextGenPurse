import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'profile_section.dart';
import 'app_bar_action_button.dart';

class HomeAppBar extends StatelessWidget implements PreferredSizeWidget {
  /// User's profile image path
  final String? profileImagePath;

  /// Greeting message (e.g., "Hello, Ashraf")
  final String greeting;

  /// Subtitle message (e.g., "Let's do a lot today")
  final String subtitle;

  /// Cart icon callback
  final VoidCallback? onCartPressed;

  /// Orders icon callback
  final VoidCallback? onOrdersPressed;

  /// Cart item count badge
  final int cartCount;

  /// Background color
  final Color? backgroundColor;

  const HomeAppBar({
    super.key,
    this.profileImagePath,
    this.greeting = 'Hello',
    this.subtitle = "Let's do a lot today",
    this.onCartPressed,
    this.onOrdersPressed,
    this.cartCount = 0,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        color: backgroundColor ?? Colors.white,
        padding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 16.h),
        child: Row(
          children: [
            // Profile Section
            Expanded(
              child: ProfileSection(
                imagePath: profileImagePath,
                greeting: greeting,
                subtitle: subtitle,
              ),
            ),
            SizedBox(width: 16.w),
            // Action Icons
            Row(
              children: [
                AppBarActionButton(
                  iconPath: 'assets/icons/cart.svg',
                  onPressed: onCartPressed,
                ),
                SizedBox(width: 12.w),
                AppBarActionButton(
                  iconPath: 'assets/icons/orders.svg',
                  onPressed: onOrdersPressed,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(100.h);
}
