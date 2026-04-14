import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../utils/platform_responsive.dart';

class AppTextField extends StatefulWidget {
  final String? label;
  final String hintText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool isPassword;
  final bool? obscureText; // External control
  final TextEditingController? controller;
  final TextInputType keyboardType;

  const AppTextField({
    super.key,
    this.label,
    required this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.isPassword = false,
    this.obscureText,
    this.controller,
    this.keyboardType = TextInputType.text,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  bool _internalObscureText = false;

  @override
  void initState() {
    super.initState();
    // Default to true if it is a password field
    _internalObscureText = widget.isPassword;
  }

  bool get _effectiveObscureText => widget.obscureText ?? _internalObscureText;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Label Text (If provided)
        if (widget.label != null && widget.label!.isNotEmpty) ...[
          Text(
            widget.label!,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: PlatformResponsive.sp(14),
              fontWeight: FontWeight.w600,
              fontFamily: 'Inter',
            ),
          ),
          SizedBox(height: PlatformResponsive.h(8)),
        ],
        // The Input Field
        TextFormField(
          controller: widget.controller,
          obscureText: _effectiveObscureText,
          keyboardType: widget.keyboardType,
          style: TextStyle(
            fontSize: PlatformResponsive.sp(14),
            fontFamily: 'Inter',
            color: AppColors.textPrimary,
          ),
          decoration: InputDecoration(
            hintText: widget.hintText,
            hintStyle: TextStyle(
              color: const Color(0xFF999999), // Muted grey placeholder
              fontSize: PlatformResponsive.sp(14),
              fontFamily: 'Inter',
              fontWeight: FontWeight.w400,
            ),
            filled: true,
            fillColor: Colors.white,
            prefixIcon: widget.prefixIcon != null
                ? Padding(
                    padding: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(12)),
                    child: widget.prefixIcon,
                  )
                : null,
            prefixIconConstraints: BoxConstraints(
              minWidth: PlatformResponsive.w(40),
            ),
            // Internal padding to make it feel roomy
            contentPadding: EdgeInsets.only(
              left: PlatformResponsive.w(13),
              right: PlatformResponsive.w(13),
              top: PlatformResponsive.h(16),
              bottom: PlatformResponsive.h(16),
            ),
            // Default border state
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(PlatformResponsive.r(7)),
              borderSide: const BorderSide(color: Color(0xFFD4D4D4), width: 1.0),
            ),
            // Enabled, but not focused border state
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(PlatformResponsive.r(7)),
              borderSide: const BorderSide(color: Color(0xFFD4D4D4), width: 1.0),
            ),
            // Highlighted border state
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(PlatformResponsive.r(7)),
              borderSide: BorderSide(color: AppColors.primary, width: 1.5),
            ),
            // Conditionally show an eye-toggle icon for passwords, or passthrough custom icons
            suffixIcon: widget.isPassword
                ? Padding(
                    padding: EdgeInsets.only(right: PlatformResponsive.w(8)),
                    child: IconButton(
                      icon: Icon(
                        _effectiveObscureText ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        color: const Color(0xFF999999),
                        size: PlatformResponsive.w(20),
                      ),
                      onPressed: () {
                        setState(() {
                          _internalObscureText = !_internalObscureText;
                        });
                      },
                      splashRadius: 20,
                    ),
                  )
                : widget.suffixIcon,
          ),
        ),
      ],
    );
  }
}
