import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/widgets/auth_layout.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({super.key});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  String _otp = "";
  final int _otpLength = 5;
  bool _isWrongCode = false;

  void _onNumberPress(String number) {
    if (_otp.length < _otpLength) {
      setState(() {
        _otp += number;
        _isWrongCode = false; // Reset error when typing
      });
    }
  }

  void _onDelete() {
    if (_otp.isNotEmpty) {
      setState(() {
        _otp = _otp.substring(0, _otp.length - 1);
        _isWrongCode = false; // Reset error when deleting
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          AppText(
            'Enter the verification code sent to you',
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          SizedBox(height: PlatformResponsive.h(8)),
          AppText.bodySecondary(
            'We have sent an OTP to "Johndoe@gmail.com"',
            align: TextAlign.start,
          ),
          
          SizedBox(height: PlatformResponsive.h(32)),

          // 5-Digit OTP Display
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(_otpLength, (index) {
              final isFilled = index < _otp.length;
              final isActive = index == _otp.length;
              return Container(
                width: PlatformResponsive.w(52),
                height: PlatformResponsive.h(60),
                margin: EdgeInsets.symmetric(horizontal: PlatformResponsive.w(4)),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: _isWrongCode 
                        ? Colors.red 
                        : (isActive ? AppColors.primary : const Color(0xFFD4D4D4)),
                    width: (isActive || _isWrongCode) ? 1.5 : 1.0,
                  ),
                ),
                child: Center(
                  child: Text(
                    isFilled ? _otp[index] : "",
                    style: TextStyle(
                      fontSize: PlatformResponsive.sp(20),
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
              );
            }),
          ),
          
          SizedBox(height: PlatformResponsive.h(20)),

          // Resend Timer OR Error Message
          _isWrongCode 
            ? Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  AppText.bodySecondary(
                    'Wrong code ',
                    fontSize: 14,
                  ),
                  GestureDetector(
                    onTap: () {
                      // Handle resend logic
                      setState(() => _isWrongCode = false);
                    },
                    child: Text(
                      'resend',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: PlatformResponsive.sp(14),
                        fontWeight: FontWeight.w500,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.primary,
                      ),
                    ),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  const Icon(Icons.refresh, size: 18, color: Color(0xFF565656)),
                  SizedBox(width: PlatformResponsive.w(8)),
                  AppText.bodySecondary(
                    'Resend code in 4s',
                    fontSize: 14,
                  ),
                ],
              ),

          SizedBox(height: PlatformResponsive.h(32)),

          // Next Button
          AppButton(
            label: 'Next',
            onPressed: _otp.length == _otpLength ? () {
              // FOR DEMO: Toggle error if code is NOT 12345
              if (_otp != "12345") {
                setState(() => _isWrongCode = true);
              } else {
                context.push('/reset-password');
              }
            } : null,
            fullWidth: true,
            height: PlatformResponsive.h(50),
            borderRadius: 10,
          ),

          SizedBox(height: PlatformResponsive.h(32)),

          // Custom Number Pad
          _buildNumpad(),

          SizedBox(height: PlatformResponsive.h(40)), // Extra space for gesture bar
        ],
      ),
    );
  }

  Widget _buildNumpad() {
    return Column(
      children: [
        _buildNumpadRow(['1', '2', '3']),
        SizedBox(height: PlatformResponsive.h(12)),
        _buildNumpadRow(['4', '5', '6']),
        SizedBox(height: PlatformResponsive.h(12)),
        _buildNumpadRow(['7', '8', '9']),
        SizedBox(height: PlatformResponsive.h(12)),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            SizedBox(width: PlatformResponsive.w(64), height: PlatformResponsive.h(64)), // Placeholder
            _buildNumpadButton('0'),
            _buildBackspaceButton(),
          ],
        ),
      ],
    );
  }

  Widget _buildNumpadRow(List<String> numbers) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: numbers.map((n) => _buildNumpadButton(n)).toList(),
    );
  }

  Widget _buildNumpadButton(String number) {
    final size = PlatformResponsive.w(64);
    return InkWell(
      onTap: () => _onNumberPress(number),
      borderRadius: BorderRadius.circular(size / 2),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          border: Border.all(
            color: const Color(0xFFD4D4D4),
            width: 1,
          ),
        ),
        child: Center(
          child: Text(
            number,
            style: TextStyle(
              fontSize: PlatformResponsive.sp(22),
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBackspaceButton() {
    final size = PlatformResponsive.w(64);
    return InkWell(
      onTap: _onDelete,
      borderRadius: BorderRadius.circular(size / 2),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(
          color: Colors.white,
          shape: BoxShape.circle,
          border: Border.all(
            color: const Color(0xFFD4D4D4),
            width: 1,
          ),
        ),
        child: const Center(
          child: Icon(
            Icons.backspace_outlined,
            color: Colors.redAccent,
            size: 20,
          ),
        ),
      ),
    );
  }
}
