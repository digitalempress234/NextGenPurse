import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../widget/promotional_banner.dart';

class BannerCarousel extends StatefulWidget {
  /// List of banner data
  final List<BannerData> banners;

  /// Auto scroll enabled
  final bool autoScroll;

  /// Auto scroll duration
  final Duration autoScrollDuration;

  const BannerCarousel({
    super.key,
    required this.banners,
    this.autoScroll = false,
    this.autoScrollDuration = const Duration(seconds: 5),
  });

  @override
  State<BannerCarousel> createState() => _BannerCarouselState();
}

class _BannerCarouselState extends State<BannerCarousel> {
  late PageController _pageController;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();

    if (widget.autoScroll) {
      _startAutoScroll();
    }
  }

  void _startAutoScroll() {
    Future.delayed(widget.autoScrollDuration, () {
      if (mounted) {
        _pageController.nextPage(
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.banners.isEmpty) {
      return SizedBox.shrink();
    }

    return Column(
      children: [
        // Banner carousel
        SizedBox(
          height: 170.h,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (index) {
              setState(() {
                _currentIndex = index;
              });

              if (widget.autoScroll) {
                _startAutoScroll();
              }
            },
            itemCount: widget.banners.length,
            itemBuilder: (context, index) {
              final banner = widget.banners[index];
              return Padding(
                padding: EdgeInsets.symmetric(horizontal: 20.w),
                child: PromotionalBanner(
                  subtitle: banner.subtitle,
                  title: banner.title,
                  dealText: banner.dealText,
                  buttonText: banner.buttonText,
                  imagePath: banner.imagePath,
                  backgroundColor: banner.backgroundColor,
                  onButtonPressed: banner.onButtonPressed,
                ),
              );
            },
          ),
        ),
        SizedBox(height: 12.h),
        // Pagination dots
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(
            widget.banners.length,
            (index) => Container(
              margin: EdgeInsets.symmetric(horizontal: 4.w),
              width: _currentIndex == index ? 8.w : 6.w,
              height: 6.w,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: _currentIndex == index
                    ? const Color(0xFFFF7F34)
                    : const Color(0xFFDDDDDD),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class BannerData {
  final String subtitle;
  final String title;
  final String dealText;
  final String buttonText;
  final String imagePath;
  final Color backgroundColor;
  final VoidCallback? onButtonPressed;

  BannerData({
    required this.subtitle,
    required this.title,
    required this.dealText,
    required this.buttonText,
    required this.imagePath,
    required this.backgroundColor,
    this.onButtonPressed,
  });
}
