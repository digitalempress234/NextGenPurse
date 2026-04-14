import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/auth_layout.dart';

import '../../../../core/widgets/social_auth_button.dart';

class SigninScreen extends StatefulWidget {
  const SigninScreen({super.key});

  @override
  State<SigninScreen> createState() => _SigninScreenState();
}

class _SigninScreenState extends State<SigninScreen> {
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
              'Welcome back',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            SizedBox(height: PlatformResponsive.h(4)),
            AppText.bodySecondary(
              'Kindly fill in your details to get back into your account',
            ),

            SizedBox(height: PlatformResponsive.h(32)),

            // Google Sign In
            SocialAuthButton(
              label: 'Sign in with Google',
              onPressed: () {},
              icon: Image.network(
                'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1024px-Google_%22G%22_logo.svg.png',
                width: 24,
                height: 24,
              ),
            ),

            SizedBox(height: PlatformResponsive.h(24)),

            // Divider
            Row(
              children: [
                Expanded(child: Divider(color: const Color(0xFFEEEEEE))),
                Padding(
                  padding: EdgeInsets.symmetric(
                    horizontal: PlatformResponsive.w(10),
                  ),
                  child: AppText.bodySecondary(
                    'Or Continue with',
                    fontSize: 12,
                  ),
                ),
                Expanded(child: Divider(color: const Color(0xFFEEEEEE))),
              ],
            ),

            SizedBox(height: PlatformResponsive.h(24)),

            // Email Field
            AppTextField(
              label: 'Email Address',
              hintText: 'Johndoe@ |',
              prefixIcon: Icon(
                Icons.mail_outline,
                color: Color(0xFF565656),
                size: 20,
              ),
              keyboardType: TextInputType.emailAddress,
            ),

            SizedBox(height: PlatformResponsive.h(20)),

            // Password Field
            AppTextField(
              label: 'Password',
              hintText: 'Enter password',
              isPassword: true,
              prefixIcon: Icon(
                Icons.lock_outline,
                color: Color(0xFF565656),
                size: 20,
              ),
            ),

            SizedBox(height: PlatformResponsive.h(12)),

            // Forgot Password Link
            Align(
              alignment: Alignment.centerRight,
              child: TextButton(
                onPressed: () {
                  context.push('/forgot-password');
                },
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
                child: Text(
                  'Forgot Password?',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontSize: PlatformResponsive.sp(14),
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Inter',
                  ),
                ),
              ),
            ),

            SizedBox(height: PlatformResponsive.h(32)),

            // Sign In Button
            AppButton(
              label: 'Login',
              onPressed: () {
                // Navigate to home screen
                context.go('/home');
              },
              fullWidth: true,
              height: PlatformResponsive.h(50),
              borderRadius: 10,
            ),

            SizedBox(height: PlatformResponsive.h(32)),

            // Footer (Don't have an account? Sign Up)
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
                    const TextSpan(text: "Don't Have an Account? "),
                    TextSpan(
                      text: 'Sign Up',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.primary,
                      ),
                      recognizer: TapGestureRecognizer()
                        ..onTap = () {
                          context.push('/signup');
                        },
                    ),
                  ],
                ),
              ),
            ),

            SizedBox(height: PlatformResponsive.h(40)),
          ],
        ),
      ),
    );
  }
}
