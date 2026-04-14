import 'package:flutter/material.dart';

class DeviceUtils {
  DeviceUtils._();

  /// Returns the screen width.
  static double screenWidth(BuildContext context) =>
      MediaQuery.of(context).size.width;

  /// Returns the screen height.
  static double screenHeight(BuildContext context) =>
      MediaQuery.of(context).size.height;

  /// Returns true if the keyboard is currently visible.
  static bool isKeyboardVisible(BuildContext context) =>
      MediaQuery.of(context).viewInsets.bottom > 0;

  /// Returns true if the device is a tablet (width >= 600).
  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.shortestSide >= 600;

  /// Returns true if the device is in landscape orientation.
  static bool isLandscape(BuildContext context) =>
      MediaQuery.of(context).orientation == Orientation.landscape;

  /// Returns the status bar height.
  static double statusBarHeight(BuildContext context) =>
      MediaQuery.of(context).padding.top;

  /// Returns the bottom safe area height.
  static double bottomBarHeight(BuildContext context) =>
      MediaQuery.of(context).padding.bottom;

  /// Hides the soft keyboard.
  static void hideKeyboard(BuildContext context) =>
      FocusScope.of(context).unfocus();
}
