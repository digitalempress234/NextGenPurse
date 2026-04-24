import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class FilterDrawer extends StatefulWidget {
  const FilterDrawer({super.key});

  @override
  State<FilterDrawer> createState() => _FilterDrawerState();
}

class _FilterDrawerState extends State<FilterDrawer> {
  final List<String> _deliveryOptions = [
    'Deliver immediately',
    'Deliver within 3-days',
    'Deliver within 5-days',
    'Deliver within 8-days',
    'Deliver within 10-days',
  ];
  List<bool> _deliverySelections = List.filled(5, false);

  final List<String> _ratingOptions = [
    '3.0 upwards',
    '4.0 upwards',
    '4.5 upwards',
    '5.0 upwards',
  ];
  List<bool> _ratingSelections = List.filled(4, false);

  RangeValues _priceRange = const RangeValues(2000, 14000);

  @override
  Widget build(BuildContext context) {
    return Drawer(
      backgroundColor: Colors.white,
      child: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: Icon(
                      Icons.close,
                      size: 24.sp,
                      color: const Color(0xFF1A1A1A),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Text(
                    'Filter',
                    style: TextStyle(
                      fontSize: 20.sp,
                      fontWeight: FontWeight.w600,
                      color: const Color(0xFF1A1A1A),
                      fontFamily: 'Inter',
                    ),
                  ),
                ],
              ),
            ),
            Divider(color: const Color(0xFFE5E5E5), height: 1, thickness: 1),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                child: Padding(
                  padding: EdgeInsets.all(20.w),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Estimated Delivery Time
                      Text(
                        'Estimated delivery time',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A1A),
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(height: 16.h),
                      ...List.generate(_deliveryOptions.length, (index) {
                        return _buildCheckboxRow(
                          _deliveryOptions[index],
                          _deliverySelections[index],
                          (val) {
                            setState(() {
                              _deliverySelections[index] = val ?? false;
                            });
                          },
                        );
                      }),
                      SizedBox(height: 16.h),
                      Divider(
                        color: const Color(0xFFE5E5E5),
                        height: 1,
                        thickness: 1,
                      ),
                      SizedBox(height: 24.h),

                      // Store Rating
                      Text(
                        'Store rating',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A1A),
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(height: 16.h),
                      ...List.generate(_ratingOptions.length, (index) {
                        return _buildCheckboxRow(
                          _ratingOptions[index],
                          _ratingSelections[index],
                          (val) {
                            setState(() {
                              _ratingSelections[index] = val ?? false;
                            });
                          },
                        );
                      }),
                      SizedBox(height: 16.h),
                      Divider(
                        color: const Color(0xFFE5E5E5),
                        height: 1,
                        thickness: 1,
                      ),
                      SizedBox(height: 24.h),

                      // Price Range
                      Text(
                        'Price',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF1A1A1A),
                          fontFamily: 'Inter',
                        ),
                      ),
                      SizedBox(height: 16.h),
                      SliderTheme(
                        data: SliderThemeData(
                          activeTrackColor: const Color(0xFFFF7F34),
                          inactiveTrackColor: const Color(0xFFE5E5E5),
                          thumbColor: const Color(0xFFFF7F34),
                          overlayColor: const Color(
                            0xFFFF7F34,
                          ).withOpacity(0.2),
                          trackHeight: 4.h,
                        ),
                        child: RangeSlider(
                          values: _priceRange,
                          min: 0,
                          max: 50000,
                          divisions: 50,
                          onChanged: (RangeValues values) {
                            setState(() {
                              _priceRange = values;
                            });
                          },
                        ),
                      ),
                      Text(
                        'N ${_priceRange.start.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')} - ${_priceRange.end.round().toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]},')}',
                        style: TextStyle(
                          fontSize: 14.sp,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF1A1A1A),
                          fontFamily: 'Inter',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // Footer Buttons
            Padding(
              padding: EdgeInsets.all(20.w),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      style: OutlinedButton.styleFrom(
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                        side: const BorderSide(color: Color(0xFFCCCCCC)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                      ),
                      onPressed: () {
                        setState(() {
                          _deliverySelections = List.filled(5, false);
                          _ratingSelections = List.filled(4, false);
                          _priceRange = const RangeValues(2000, 14000);
                        });
                      },
                      child: Text(
                        'Reset',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w500,
                          color: const Color(0xFF1A1A1A),
                          fontFamily: 'Inter',
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFF7F34),
                        padding: EdgeInsets.symmetric(vertical: 14.h),
                        elevation: 0,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8.r),
                        ),
                      ),
                      onPressed: () {
                        // Apply filter logic here
                        Navigator.pop(context);
                      },
                      child: Text(
                        'Apply',
                        style: TextStyle(
                          fontSize: 16.sp,
                          fontWeight: FontWeight.w500,
                          color: Colors.white,
                          fontFamily: 'Inter',
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckboxRow(
    String title,
    bool value,
    ValueChanged<bool?> onChanged,
  ) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Row(
        children: [
          SizedBox(
            width: 20.w,
            height: 20.w,
            child: Checkbox(
              value: value,
              onChanged: onChanged,
              activeColor: const Color(0xFFFF7F34),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4.r),
              ),
              side: BorderSide(color: const Color(0xFFCCCCCC), width: 1.5.w),
            ),
          ),
          SizedBox(width: 12.w),
          Text(
            title,
            style: TextStyle(
              fontSize: 14.sp,
              fontWeight: FontWeight.w400,
              color: const Color(0xFF1A1A1A),
              fontFamily: 'Inter',
            ),
          ),
        ],
      ),
    );
  }
}
