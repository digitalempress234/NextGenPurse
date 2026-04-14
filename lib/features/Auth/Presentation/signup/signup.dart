import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/auth_layout.dart';

class SignupScreen extends StatefulWidget {
  const SignupScreen({super.key});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  bool _agreeToTerms = false;

  @override
  Widget build(BuildContext context) {
    return AuthLayout(
      child: SingleChildScrollView(
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            AppText(
              'Sign up',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            SizedBox(height: PlatformResponsive.h(4)),
            AppText.bodySecondary(
              'Create a free account and start shopping',
            ),
            
            SizedBox(height: PlatformResponsive.h(24)),

            // Name Row
            Row(
              children: [
                Expanded(
                  child: AppTextField(
                    label: 'First name',
                    hintText: 'E.g. John',
                  ),
                ),
                SizedBox(width: PlatformResponsive.w(15)),
                Expanded(
                  child: AppTextField(
                    label: 'Last name',
                    hintText: 'E.g. Micheal',
                  ),
                ),
              ],
            ),
            
            SizedBox(height: PlatformResponsive.h(20)),

            // Email
            AppTextField(
              label: 'Email',
              hintText: 'E.g. JohnMicheal@gmail.com',
              keyboardType: TextInputType.emailAddress,
            ),
            
            SizedBox(height: PlatformResponsive.h(20)),

            // Password
            AppTextField(
              label: 'Password',
              hintText: 'Enter Password',
              isPassword: true,
            ),
            
            SizedBox(height: PlatformResponsive.h(20)),

            // Confirm Password
            AppTextField(
              label: 'Confirm Password',
              hintText: 'Enter Password',
              isPassword: true,
            ),
            
            SizedBox(height: PlatformResponsive.h(20)),

            // Terms & Conditions Checkbox
            Row(
              children: [
                SizedBox(
                  height: 24,
                  width: 24,
                  child: Checkbox(
                    value: _agreeToTerms,
                    onChanged: (value) {
                      setState(() {
                        _agreeToTerms = value ?? false;
                      });
                    },
                    activeColor: AppColors.primary,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                    side: BorderSide(
                      color: const Color(0xFFD4D4D4),
                      width: 1.5,
                    ),
                  ),
                ),
                SizedBox(width: PlatformResponsive.w(10)),
                Expanded(
                  child: Text.rich(
                    TextSpan(
                      style: TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: PlatformResponsive.sp(14),
                        fontWeight: FontWeight.w500,
                        fontFamily: 'Inter',
                      ),
                      children: [
                        const TextSpan(text: 'I Agree with to '),
                        TextSpan(
                          text: 'Terms & Conditions',
                          style: TextStyle(
                            color: AppColors.primary,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()..onTap = () {},
                        ),
                        const TextSpan(text: ' and '),
                        TextSpan(
                          text: 'Privacy Policy',
                          style: TextStyle(
                            color: AppColors.primary,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()..onTap = () {},
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),

            SizedBox(height: PlatformResponsive.h(40)),

            // Create Account Button
            AppButton(
              label: 'Create account',
              onPressed: () {
                // Handle signup
              },
              fullWidth: true,
              height: PlatformResponsive.h(50),
              borderRadius: 10,
            ),

            SizedBox(height: PlatformResponsive.h(24)),

            // Footer (Already have an account? Login)
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
                    const TextSpan(text: 'Already Have an Account? '),
                    TextSpan(
                      text: 'Login',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                      ),
                      recognizer: TapGestureRecognizer()..onTap = () {
                        context.push('/signin');
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: PlatformResponsive.h(40)), // Padding at bottom
          ],
        ),
      ),
    );
  }
}
