import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/utils/platform_responsive.dart';
import '../../../../../core/widgets/app_button.dart';
import '../../../../../core/widgets/app_text.dart';
import '../../../../../core/widgets/legal_footer.dart';

class OnboardingData {
  final String image;
  final String title;
  final String subtitle;

  OnboardingData({
    required this.image,
    required this.title,
    required this.subtitle,
  });
}

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<OnboardingData> _pages = [
    OnboardingData(
      image: 'assets/onboarding/Onboard1.png',
      title: 'Welcome to Superstore',
      subtitle: 'Find the best deals from top brands and get them delivered fast.',
    ),
    OnboardingData(
      image: 'assets/onboarding/onboard2.png',
      title: 'Compare deals',
      subtitle: 'Compare prices of products with other competing store and go for the on that fits yyour budget',
    ),
    OnboardingData(
      image: 'assets/onboarding/onboard3.png',
      title: 'Earn rewards',
      subtitle: 'Earn rewards while you shop refer your friends get masive discount from our coupon codes',
    ),
    OnboardingData(
      image: 'assets/onboarding/onboard4.png',
      title: 'Buy now pay later',
      subtitle: 'Shop with ease and pay in installment according to your budget',
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      context.push('/signup');
    }
  }

  void _skipOnboarding() {
    context.push('/signin');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surfaceLight,
      body: SafeArea(
        child: Column(
          children: [
            // 1. Image area with White Gradient Mask at the bottom
            Expanded(
              flex: 55, // Takes roughly 55% of the screen height
              child: PageView.builder(
                controller: _pageController,
                physics: const BouncingScrollPhysics(),
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  return Stack(
                    fit: StackFit.expand,
                    children: [
                      // The Image
                      Image.asset(
                        _pages[index].image,
                        fit: BoxFit.cover, // Adjusts the image to cover the space
                        alignment: Alignment.topCenter,
                      ),
                      // The White Fade Overlay
                      Positioned(
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: PlatformResponsive.h(40),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.white.withOpacity(0.0),
                                Colors.white,
                              ],
                              stops: const [0.0, 1.0],
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),

            // 2. Content area
            Expanded(
              flex: 45, // Takes the remaining 45%
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(24)),
                child: Column(
                  children: [
                    SizedBox(height: PlatformResponsive.h(15)),

                    // Progress Indicator
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        _pages.length,
                        (index) => AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          margin: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(4)),
                          height: PlatformResponsive.h(2),
                          width: PlatformResponsive.w(38),
                          decoration: BoxDecoration(
                            color: _currentPage == index
                                ? AppColors.primary
                                : const Color(0xFFD9D9D9),
                            borderRadius: BorderRadius.circular(PlatformResponsive.r(46)),
                          ),
                        ),
                      ),
                    ),

                    SizedBox(height: PlatformResponsive.h(30)),

                    // Title
                    AppText(
                      _pages[_currentPage].title,
                      fontSize: 22,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                      textAlign: TextAlign.center,
                    ),

                    SizedBox(height: PlatformResponsive.h(12)),

                    // Subtitle
                    AppText.bodySecondary(
                      _pages[_currentPage].subtitle,
                      align: TextAlign.center,
                    ),

                    const Spacer(), // Pushes buttons and footer down

                    // Action Row (Skip & Next)
                    if (_currentPage == _pages.length - 1)
                      AppButton(
                        label: 'Get started',
                        onPressed: _nextPage,
                        fullWidth: true,
                        height: PlatformResponsive.h(50),
                        borderRadius: 10,
                        padding: EdgeInsets.all(PlatformResponsive.w(10)),
                      )
                    else
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Skip Button
                          TextButton(
                            onPressed: _skipOnboarding,
                            style: TextButton.styleFrom(
                              foregroundColor: AppColors.primary,
                              padding: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(8)),
                            ),
                            child: Text(
                              'Skip',
                              style: TextStyle(
                                fontSize: PlatformResponsive.sp(14),
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),

                          // Next Button
                          AppButton(
                            label: 'Next',
                            onPressed: _nextPage,
                            fullWidth: false,
                            width: PlatformResponsive.w(176),
                            height: PlatformResponsive.h(50),
                            borderRadius: 10,
                            padding: EdgeInsets.all(PlatformResponsive.w(10)),
                            suffixIcon: const Icon(Icons.arrow_forward, color: Colors.white, size: 20),
                          ),
                        ],
                      ),

                    SizedBox(height: PlatformResponsive.h(40)),

                    // Terms Footer
                    _buildTermsAndConditions(),
                    SizedBox(height: PlatformResponsive.h(20)),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // Helper widget to build the RichText footer
  Widget _buildTermsAndConditions() {
    return const LegalFooter();
  }
}
