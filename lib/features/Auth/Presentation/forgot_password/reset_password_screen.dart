import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/auth_layout.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;

  @override
  void dispose() {
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          AppText(
            'Create new password',
            fontSize: 24,
            fontWeight: FontWeight.w700,
            color: AppColors.textPrimary,
          ),
          SizedBox(height: PlatformResponsive.h(8)),
          AppText.bodySecondary(
            'Make sure your password is secure',
            align: TextAlign.start,
          ),
          
          SizedBox(height: PlatformResponsive.h(32)),

          // Password Field
          AppText(
            'Password',
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          SizedBox(height: PlatformResponsive.h(8)),
          AppTextField(
            controller: _passwordController,
            hintText: 'Enter password',
            obscureText: !_isPasswordVisible,
            suffixIcon: IconButton(
              icon: Icon(
                _isPasswordVisible ? Icons.visibility : Icons.visibility_off_outlined,
                color: const Color(0xFFC4C4C4),
                size: 20,
              ),
              onPressed: () {
                setState(() => _isPasswordVisible = !_isPasswordVisible);
              },
            ),
          ),

          SizedBox(height: PlatformResponsive.h(24)),

          // Confirm Password Field
          AppText(
            'Confirm password',
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
          SizedBox(height: PlatformResponsive.h(8)),
          AppTextField(
            controller: _confirmPasswordController,
            hintText: 'Enter password again',
            obscureText: !_isConfirmPasswordVisible,
            suffixIcon: IconButton(
              icon: Icon(
                _isConfirmPasswordVisible ? Icons.visibility : Icons.visibility_off_outlined,
                color: const Color(0xFFC4C4C4),
                size: 20,
              ),
              onPressed: () {
                setState(() => _isConfirmPasswordVisible = !_isConfirmPasswordVisible);
              },
            ),
          ),

          SizedBox(height: PlatformResponsive.h(40)),

          // Submit Button
          AppButton(
            label: 'Submit',
            onPressed: () {
              // Handle password update logic then navigate to Sign In
              context.go('/signin');
            },
            fullWidth: true,
            height: PlatformResponsive.h(50),
            borderRadius: 10,
          ),

          SizedBox(height: PlatformResponsive.h(32)),

          // Login Link
          Center(
            child: Text.rich(
              TextSpan(
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: PlatformResponsive.sp(14),
                  fontWeight: FontWeight.w500,
                  fontFamily: 'Inter',
                ),
                children: [
                  const TextSpan(text: "Remember password? "),
                  WidgetSpan(
                    child: GestureDetector(
                      onTap: () => context.go('/signin'),
                      child: Text(
                        'Login',
                        style: TextStyle(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Inter',
                          fontSize: PlatformResponsive.sp(14),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          SizedBox(height: PlatformResponsive.h(40)),
        ],
      ),
    );
  }
}
