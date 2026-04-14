import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

class AuthLayout extends StatelessWidget {
  final Widget child;
  final VoidCallback? onBack;
  final bool showBackButton;

  const AuthLayout({
    super.key,
    required this.child,
    this.onBack,
    this.showBackButton = true,
  });

  @override
  Widget build(BuildContext context) {
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light.copyWith(
        statusBarColor: Colors.transparent, // Ensures the orange flows behind
        statusBarIconBrightness: Brightness.light,
      ),
      child: Scaffold(
        backgroundColor: AppColors.primary,
        body: Column(
          children: [
            // Top Area (Orange Background - account for status bar)
            SizedBox(
              height: PlatformResponsive.h(30) + MediaQuery.of(context).padding.top,
            ),
            
            // Main White Container
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(PlatformResponsive.r(20)),
                    topRight: Radius.circular(PlatformResponsive.r(20)),
                  ),
                ),
                padding: EdgeInsets.only(
                  top: PlatformResponsive.h(12),
                  left: PlatformResponsive.w(19),
                  right: PlatformResponsive.w(21),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (showBackButton)
                      IconButton(
                        onPressed: onBack ?? () {
                          if (context.canPop()) {
                            context.pop();
                          }
                        },
                        icon: const Icon(
                          Icons.arrow_back,
                          color: AppColors.textPrimary,
                        ),
                        padding: EdgeInsets.zero,
                        alignment: Alignment.centerLeft,
                      ),
                    
                    SizedBox(height: PlatformResponsive.h(8)),
                    
                    Expanded(
                      child: SingleChildScrollView(
                        physics: const BouncingScrollPhysics(),
                        child: child,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
