import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class PlatformResponsive {
  // Base design dimensions
  static const double _designWidth = 375.0;
  static const double _designHeight = 812.0;

  // Get screen width safely
  static double get screenWidth {
    if (kIsWeb) {
      return _designWidth; // Use design width as fallback for web
    }
    try {
      return ScreenUtil().screenWidth;
    } catch (e) {
      return _designWidth;
    }
  }

  // Get screen height safely
  static double get screenHeight {
    if (kIsWeb) {
      return _designHeight; // Use design height as fallback for web
    }
    try {
      return ScreenUtil().screenHeight;
    } catch (e) {
      return _designHeight;
    }
  }

  // Responsive width - works on both mobile and web
  static double w(double width) {
    if (kIsWeb) {
      return width * (screenWidth / _designWidth);
    }
    try {
      return width.w;
    } catch (e) {
      return width;
    }
  }

  // Responsive height - works on both mobile and web
  static double h(double height) {
    if (kIsWeb) {
      return height * (screenHeight / _designHeight);
    }
    try {
      return height.h;
    } catch (e) {
      return height;
    }
  }

  // Responsive font size - works on both mobile and web
  static double sp(double fontSize) {
    if (kIsWeb) {
      return fontSize * (screenWidth / _designWidth);
    }
    try {
      return fontSize.sp;
    } catch (e) {
      return fontSize;
    }
  }

  // Responsive radius - works on both mobile and web
  static double r(double radius) {
    if (kIsWeb) {
      return radius * (screenWidth / _designWidth);
    }
    try {
      return radius.r;
    } catch (e) {
      return radius;
    }
  }

  // Platform-aware EdgeInsets
  static EdgeInsets all(double value) {
    return EdgeInsets.all(w(value));
  }

  static EdgeInsets symmetric({double? horizontal, double? vertical}) {
    return EdgeInsets.symmetric(
      horizontal: horizontal != null ? w(horizontal) : 0,
      vertical: vertical != null ? h(vertical) : 0,
    );
  }

  static EdgeInsets only({
    double? left,
    double? top,
    double? right,
    double? bottom,
  }) {
    return EdgeInsets.only(
      left: left != null ? w(left) : 0,
      top: top != null ? h(top) : 0,
      right: right != null ? w(right) : 0,
      bottom: bottom != null ? h(bottom) : 0,
    );
  }

  // Platform-aware BorderRadius
  static BorderRadius circular(double radius) {
    return BorderRadius.circular(r(radius));
  }

  // Platform-aware SizedBox
  static Widget sizedBoxH(double height) {
    return SizedBox(height: h(height));
  }

  static Widget sizedBoxW(double width) {
    return SizedBox(width: w(width));
  }

  // Check if running on web
  static bool get isWeb => kIsWeb;

  // Check if ScreenUtil is available
  static bool get isScreenUtilAvailable {
    if (kIsWeb) return false;
    try {
      ScreenUtil().screenWidth;
      return true;
    } catch (e) {
      return false;
    }
  }
}

// Extension methods for easier usage
extension ResponsiveNum on num {
  double get rw => PlatformResponsive.w(toDouble());
  double get rh => PlatformResponsive.h(toDouble());
  double get rsp => PlatformResponsive.sp(toDouble());
  double get rr => PlatformResponsive.r(toDouble());
}
