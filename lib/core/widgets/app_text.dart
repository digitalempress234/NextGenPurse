import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

/// Reusable app text widget with preset styles.
class AppText extends StatelessWidget {
  final String text;
  final double? fontSize;
  final FontWeight? fontWeight;
  final Color? color;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;
  final double? letterSpacing;
  final double? height;
  final TextDecoration? decoration;

  const AppText(
    this.text, {
    super.key,
    this.fontSize,
    this.fontWeight,
    this.color,
    this.textAlign,
    this.maxLines,
    this.overflow,
    this.letterSpacing,
    this.height,
    this.decoration,
  });

  @override
  Widget build(BuildContext context) {
    return Text(
      text,
      textAlign: textAlign,
      maxLines: maxLines,
      overflow: overflow,
      style: TextStyle(
        fontFamily: 'Inter',
        fontSize: fontSize != null ? PlatformResponsive.sp(fontSize!) : PlatformResponsive.sp(14),
        fontWeight: fontWeight ?? FontWeight.w400,
        color: color ?? AppColors.textPrimary,
        letterSpacing: letterSpacing,
        height: height,
        decoration: decoration,
      ),
    );
  }

  // --- Preset Variants ---

  /// Extra large heading — 32sp, w800
  factory AppText.displayLarge(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 32, fontWeight: FontWeight.w800, color: color, textAlign: align);

  /// Large heading — 26sp, w800
  factory AppText.headingLarge(String text, {Color? color, TextAlign? align, double? letterSpacing}) =>
      AppText(text, fontSize: 26, fontWeight: FontWeight.w800, color: color, textAlign: align, letterSpacing: letterSpacing ?? 0.78);

  /// Medium heading — 20sp, w700
  factory AppText.headingMedium(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 20, fontWeight: FontWeight.w700, color: color, textAlign: align);

  /// Small heading — 16sp, w600
  factory AppText.headingSmall(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 16, fontWeight: FontWeight.w600, color: color, textAlign: align);

  /// Body regular — 14sp, w400
  factory AppText.body(String text, {Color? color, TextAlign? align, int? maxLines}) =>
      AppText(text, fontSize: 14, fontWeight: FontWeight.w400, color: color, textAlign: align, maxLines: maxLines, overflow: maxLines != null ? TextOverflow.ellipsis : null);

  /// Body medium — 14sp, w500
  factory AppText.bodyMedium(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 14, fontWeight: FontWeight.w500, color: color, textAlign: align);

  /// Small text — 12sp, w400
  factory AppText.small(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 12, fontWeight: FontWeight.w400, color: color, textAlign: align);

  /// Caption — 11sp, w400
  factory AppText.caption(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 11, fontWeight: FontWeight.w400, color: color ?? AppColors.textSecondary, textAlign: align);

  /// Label — 12sp, w600
  factory AppText.label(String text, {Color? color, TextAlign? align}) =>
      AppText(text, fontSize: 12, fontWeight: FontWeight.w600, color: color, textAlign: align);

  /// Body secondary — 14sp, w500, secondary color, spaced
  factory AppText.bodySecondary(String text, {double? fontSize, Color? color, TextAlign? align}) =>
      AppText(
        text,
        fontSize: fontSize ?? 14,
        fontWeight: FontWeight.w500,
        color: color ?? AppColors.textSecondary,
        textAlign: align ?? TextAlign.center,
        height: 1.5,
        letterSpacing: 0.28,
      );

  /// Body primary underlined — 14sp, w500, primary color, spaced
  factory AppText.bodyPrimaryUnderline(String text, {Color? color, TextAlign? align}) =>
      AppText(
        text,
        fontSize: 14,
        fontWeight: FontWeight.w500,
        color: color ?? AppColors.primary,
        textAlign: align,
        height: 1.5,
        letterSpacing: 0.28,
        decoration: TextDecoration.underline,
      );
}
