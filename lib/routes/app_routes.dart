import 'package:go_router/go_router.dart';

import '../features/Auth/Presentation/splash/splash_screen.dart';
import '../features/Auth/Presentation/onboarding/screens/onboarding_screen.dart';
import '../features/Auth/Presentation/signin/signin.dart';
import '../features/Auth/Presentation/signup/signup.dart';
import '../features/Auth/Presentation/forgot_password/forgot_password_screen.dart';
import '../features/Auth/Presentation/otp_verification/otp_screen.dart';
import '../features/Auth/Presentation/forgot_password/reset_password_screen.dart';
import '../features/Home/Presentation/Screens/homescreen.dart';

final router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(path: '/', builder: (context, state) => const SplashScreen()),
    GoRoute(
      path: '/onboarding',
      builder: (context, state) => const OnboardingScreen(),
    ),
    GoRoute(path: '/signin', builder: (context, state) => const SigninScreen()),
    GoRoute(path: '/signup', builder: (context, state) => const SignupScreen()),
    GoRoute(
      path: '/forgot-password',
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(path: '/otp', builder: (context, state) => const OtpScreen()),
    GoRoute(
      path: '/reset-password',
      builder: (context, state) => const ResetPasswordScreen(),
    ),
    GoRoute(path: '/home', builder: (context, state) => const HomeScreen()),
  ],
);
