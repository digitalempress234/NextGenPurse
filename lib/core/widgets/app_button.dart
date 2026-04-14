import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

enum AppButtonVariant { primary, secondary, outline, ghost, danger }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final bool isLoading;
  final bool fullWidth;
  final double? width;
  final double? height;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final double borderRadius;
  final Color? backgroundColor;
  final Color? textColor;
  final EdgeInsetsGeometry? padding;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.isLoading = false,
    this.fullWidth = true,
    this.width,
    this.height,
    this.prefixIcon,
    this.suffixIcon,
    this.borderRadius = 7,  // Default matches Figma 7px
    this.backgroundColor,
    this.textColor,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;

    Color defaultBgColor;
    Color defaultTextColor;
    Color borderColor;

    switch (variant) {
      case AppButtonVariant.primary:
        defaultBgColor = isDisabled ? AppColors.textDisabled : AppColors.primary;
        defaultTextColor = AppColors.textWhite;
        borderColor = Colors.transparent;
        break;
      case AppButtonVariant.secondary:
        defaultBgColor = AppColors.accent;
        defaultTextColor = AppColors.textWhite;
        borderColor = Colors.transparent;
        break;
      case AppButtonVariant.outline:
        defaultBgColor = Colors.transparent;
        defaultTextColor = AppColors.primary;
        borderColor = AppColors.primary;
        break;
      case AppButtonVariant.ghost:
        defaultBgColor = Colors.transparent;
        defaultTextColor = AppColors.primary;
        borderColor = Colors.transparent;
        break;
      case AppButtonVariant.danger:
        defaultBgColor = AppColors.error;
        defaultTextColor = AppColors.textWhite;
        borderColor = Colors.transparent;
        break;
    }

    final finalBgColor = backgroundColor ?? defaultBgColor;
    final finalTextColor = textColor ?? defaultTextColor;
    final buttonHeight = height ?? PlatformResponsive.h(50); // Default matches Figma 50px
    final buttonWidth = fullWidth ? double.infinity : width;

    return SizedBox(
      width: buttonWidth,
      height: buttonHeight,
      child: ElevatedButton(
        onPressed: isDisabled ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: finalBgColor,
          foregroundColor: finalTextColor,
          disabledBackgroundColor: AppColors.textDisabled,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(PlatformResponsive.r(borderRadius)),
            side: BorderSide(color: borderColor),
          ),
          padding: padding ?? EdgeInsets.symmetric(horizontal: PlatformResponsive.w(16)),
        ),
        child: isLoading
            ? SizedBox(
                width: PlatformResponsive.w(20),
                height: PlatformResponsive.h(20),
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(finalTextColor),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (prefixIcon != null) ...[
                    prefixIcon!,
                    SizedBox(width: PlatformResponsive.w(10)), // 10px gap from Figma
                  ],
                  Text(
                    label,
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: PlatformResponsive.sp(15),
                      fontWeight: FontWeight.w600,
                      color: finalTextColor,
                    ),
                  ),
                  if (suffixIcon != null) ...[
                    SizedBox(width: PlatformResponsive.w(10)), // 10px gap from Figma
                    suffixIcon!,
                  ],
                ],
              ),
      ),
    );
  }
}
