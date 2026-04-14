import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/utils/platform_responsive.dart';
import '../../../../core/widgets/app_button.dart';
import '../../../../core/widgets/app_text.dart';
import '../../../../core/widgets/app_text_field.dart';
import '../../../../core/widgets/auth_layout.dart';

import '../../../../core/widgets/legal_footer.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
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
              'Forgot password',
              fontSize: 24,
              fontWeight: FontWeight.w700,
              color: AppColors.textPrimary,
            ),
            SizedBox(height: PlatformResponsive.h(8)),
            AppText.bodySecondary(
              'Don’t Worry enter your email and we will send you instructions on how to get back into your account',
              align: TextAlign.start,
            ),
            
            SizedBox(height: PlatformResponsive.h(32)),

            // Email Field
            AppTextField(
              label: 'Email Address',
              hintText: 'Johndoe@ |',
              prefixIcon: const Icon(
                Icons.mail_outline,
                color: Color(0xFF565656),
                size: 20,
              ),
              keyboardType: TextInputType.emailAddress,
            ),
            
            SizedBox(height: PlatformResponsive.h(32)),

            // Submit Button
            AppButton(
              label: 'Submit',
              onPressed: () {
                context.push('/otp');
              },
              fullWidth: true,
              height: PlatformResponsive.h(50),
              borderRadius: 10,
            ),

            SizedBox(height: PlatformResponsive.h(32)),

            // Footer (Back to Login)
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
                    TextSpan(
                      text: 'Login',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                        decoration: TextDecoration.underline,
                        decorationColor: AppColors.primary,
                      ),
                      recognizer: TapGestureRecognizer()..onTap = () {
                        context.pop(); // Returns to Sign In
                      },
                    ),
                  ],
                ),
              ),
            ),
            
            SizedBox(height: PlatformResponsive.h(100)),

            // Legal Footer at the bottom
            const LegalFooter(),

            SizedBox(height: PlatformResponsive.h(40)),
          ],
        ),
      ),
    );
  }
}
