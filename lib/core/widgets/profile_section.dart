import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'app_text.dart';

class ProfileSection extends StatelessWidget {
  /// Path to profile image
  final String? imagePath;

  /// Greeting text
  final String greeting;

  /// Subtitle text
  final String subtitle;

  const ProfileSection({
    super.key,
    this.imagePath,
    required this.greeting,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Profile Avatar
        CircleAvatar(
          radius: 28.r,
          backgroundImage:
              imagePath != null ? AssetImage(imagePath!) : null,
          backgroundColor: const Color(0xFFF0F0F0),
          child: imagePath == null
              ? Icon(Icons.person, size: 24.sp, color: Colors.grey)
              : null,
        ),
        SizedBox(width: 12.w),
        // Greeting and Subtitle
        Expanded(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Greeting text
              AppText(
                greeting,
                fontSize: 16.sp,
                fontWeight: FontWeight.w600,
                color: const Color(0xFF1A1A1A),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              SizedBox(height: 4.h),
              // Subtitle text
              AppText(
                subtitle,
                fontSize: 12.sp,
                fontWeight: FontWeight.w500,
                color: const Color(0xFF8D8D8D),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
