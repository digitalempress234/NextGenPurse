import 'package:flutter/material.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_text.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    // Simulate some loading or initialization time
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        context.go('/onboarding');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/splascreen/IMG-20240817-WA0009 1.png',
              width: PlatformResponsive.w(150), // Adjust size as needed
              height: PlatformResponsive.w(150),
              fit: BoxFit.contain,
            ),
            SizedBox(height: PlatformResponsive.h(16)),
            AppText.headingLarge('SUPERSTORE'),
          ],
        ),
      ),
    );
  }
}
