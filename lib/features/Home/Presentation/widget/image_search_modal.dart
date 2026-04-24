import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:image_picker/image_picker.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/constants/app_colors.dart';

class ImageSearchModal extends StatefulWidget {
  final VoidCallback? onClose;
  final VoidCallback? onImageSelected;

  const ImageSearchModal({super.key, this.onClose, this.onImageSelected});

  @override
  State<ImageSearchModal> createState() => _ImageSearchModalState();
}

class _ImageSearchModalState extends State<ImageSearchModal> {
  final ImagePicker _imagePicker = ImagePicker();

  Future<void> _pickImage() async {
    try {
      final pickedFile = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
      );

      if (pickedFile != null) {
        widget.onImageSelected?.call();
        if (mounted) {
          Navigator.pop(context);
        }
      }
    } catch (e) {
      print('Error picking image: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      insetPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 24.h),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: double.infinity,
        padding: EdgeInsets.all(24.w),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16.r),
          color: Colors.white,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header with Close Button
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: AppText(
                    'Find product with image search',
                    fontSize: 16.sp,
                    fontWeight: FontWeight.w600,
                    color: const Color(0xFF1A1A1A),
                  ),
                ),
                SizedBox(width: 12.w),
                GestureDetector(
                  onTap: widget.onClose ?? () => Navigator.pop(context),
                  child: Icon(
                    Icons.close,
                    size: 24.sp,
                    color: const Color(0xFF8D8D8D),
                  ),
                ),
              ],
            ),
            SizedBox(height: 28.h),
            // Upload Area
            Container(
              width: double.infinity,
              height: 200.h,
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFFE5E5E5), width: 2),
                borderRadius: BorderRadius.circular(12.r),
                color: const Color(0xFFF9F9F9),
              ),
              child: GestureDetector(
                onTap: _pickImage,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.cloud_upload_outlined,
                      size: 48.sp,
                      color: AppColors.primary,
                    ),
                    SizedBox(height: 12.h),
                    AppText(
                      'Click to upload or',
                      fontSize: 14.sp,
                      fontWeight: FontWeight.w500,
                      color: AppColors.primary,
                    ),
                    SizedBox(height: 4.h),
                    AppText(
                      'Drag and Drop your Image',
                      fontSize: 13.sp,
                      fontWeight: FontWeight.w400,
                      color: const Color(0xFF8D8D8D),
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
