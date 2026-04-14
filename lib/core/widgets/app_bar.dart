import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

class AppAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final bool showBackButton;
  final List<Widget>? actions;
  final Color? backgroundColor;
  final Color? titleColor;
  final VoidCallback? onBackPressed;
  final Widget? leading;
  final bool centerTitle;
  final double elevation;

  const AppAppBar({
    super.key,
    required this.title,
    this.showBackButton = true,
    this.actions,
    this.backgroundColor,
    this.titleColor,
    this.onBackPressed,
    this.leading,
    this.centerTitle = true,
    this.elevation = 0,
  });

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: backgroundColor ?? AppColors.surfaceLight,
      elevation: elevation,
      centerTitle: centerTitle,
      automaticallyImplyLeading: false,
      leading: leading ??
          (showBackButton
              ? GestureDetector(
                  onTap: onBackPressed ?? () => Navigator.of(context).pop(),
                  child: Container(
                    margin: EdgeInsets.all(PlatformResponsive.w(8)),
                    decoration: BoxDecoration(
                      color: AppColors.backgroundLight,
                      borderRadius: BorderRadius.circular(PlatformResponsive.r(10)),
                    ),
                    child: Icon(
                      Icons.arrow_back_ios_new_rounded,
                      size: PlatformResponsive.sp(18),
                      color: AppColors.textPrimary,
                    ),
                  ),
                )
              : null),
      title: Text(
        title,
        style: GoogleFonts.inter(
          fontSize: PlatformResponsive.sp(18),
          fontWeight: FontWeight.w700,
          color: titleColor ?? AppColors.textPrimary,
        ),
      ),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => Size.fromHeight(PlatformResponsive.h(56));
}
