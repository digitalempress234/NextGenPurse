import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'app_text.dart';

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  /// Type of app bar to display
  final AppBarType type;

  /// For home type - user profile image
  final ImageProvider? profileImage;

  /// For home type - greeting message
  final String? greeting;

  /// For home type - subtitle message
  final String? subtitle;

  /// For header type - center title text
  final String? title;

  /// Cart item count badge
  final int cartCount;

  /// Back button callback
  final VoidCallback? onBackPressed;

  /// Cart icon callback
  final VoidCallback? onCartPressed;

  /// Wishlist icon callback
  final VoidCallback? onWishlistPressed;

  /// Background color
  final Color? backgroundColor;

  /// Show cart icon
  final bool showCart;

  /// Show wishlist icon
  final bool showWishlist;

  const CustomAppBar({
    super.key,
    this.type = AppBarType.home,
    this.profileImage,
    this.greeting,
    this.subtitle,
    this.title,
    this.cartCount = 0,
    this.onBackPressed,
    this.onCartPressed,
    this.onWishlistPressed,
    this.backgroundColor,
    this.showCart = true,
    this.showWishlist = true,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      color: backgroundColor ?? Colors.white,
      padding: EdgeInsets.only(
        top: 16.h,
        bottom: 16.h,
        left: 20.w,
        right: 20.w,
      ),
      child: type == AppBarType.home
          ? _buildHomeAppBar(context)
          : _buildHeaderAppBar(context),
    );
  }

  /// Builds the home screen app bar with profile and actions
  Widget _buildHomeAppBar(BuildContext context) {
    return Row(
      children: [
        // Profile Section
        Expanded(
          child: Row(
            children: [
              // Profile Avatar
              CircleAvatar(
                radius: 28.r,
                backgroundImage: profileImage,
                backgroundColor: Colors.grey[200],
                child: profileImage == null
                    ? Icon(Icons.person, size: 24.sp)
                    : null,
              ),
              SizedBox(width: 12.w),
              // Greeting and Subtitle
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    AppText(
                      greeting ?? 'Hello',
                      fontSize: 18.sp,
                      fontWeight: FontWeight.w600,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4.h),
                    AppText(
                      subtitle ?? '',
                      fontSize: 13.sp,
                      color: Colors.grey[600],
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        SizedBox(width: 16.w),
        // Action Icons
        Row(
          children: [
            // Cart Icon
            if (showCart)
              _buildActionButton(
                icon: Icons.shopping_cart_outlined,
                onPressed: onCartPressed,
                badge: cartCount > 0 ? cartCount.toString() : null,
              ),
            if (showCart && showWishlist) SizedBox(width: 12.w),
            // Wishlist Icon
            if (showWishlist)
              _buildActionButton(
                icon: Icons.favorite,
                onPressed: onWishlistPressed,
                isSolid: true,
              ),
          ],
        ),
      ],
    );
  }

  /// Builds the header app bar with back button and centered title
  Widget _buildHeaderAppBar(BuildContext context) {
    return Row(
      children: [
        // Back Button
        GestureDetector(
          onTap: onBackPressed ?? () => Navigator.of(context).pop(),
          child: Icon(Icons.arrow_back, size: 24.sp, color: Colors.black),
        ),
        // Centered Title
        Expanded(
          child: Center(
            child: AppText(
              title ?? '',
              fontSize: 18.sp,
              fontWeight: FontWeight.w600,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
        // Empty space to balance back button
        SizedBox(width: 24.sp),
      ],
    );
  }

  /// Builds individual action buttons with optional badge
  Widget _buildActionButton({
    required IconData icon,
    required VoidCallback? onPressed,
    String? badge,
    bool isSolid = false,
  }) {
    return GestureDetector(
      onTap: onPressed,
      child: Stack(
        children: [
          Container(
            width: 33.w,
            height: 33.w,
            decoration: BoxDecoration(
              shape: BoxShape.rectangle,
              color: Colors.white,
              border: Border.all(color: const Color(0xFFE5E5E5), width: 1),
            ),
            child: Center(
              child: Icon(
                icon,
                size: 20.sp,
                color: isSolid ? Colors.red : Colors.black,
              ),
            ),
          ),
          // Badge
          if (badge != null)
            Positioned(
              top: -5.w,
              right: -5.w,
              child: Container(
                padding: EdgeInsets.all(2.w),
                decoration: const BoxDecoration(
                  color: Colors.red,
                  shape: BoxShape.circle,
                ),
                constraints: BoxConstraints(minWidth: 18.w, minHeight: 18.w),
                child: Center(
                  child: AppText(
                    badge,
                    fontSize: 10.sp,
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(72.h); // Adjust height based on your design
}

enum AppBarType {
  home, // Profile + greeting + actions
  header, // Back button + centered title
}
