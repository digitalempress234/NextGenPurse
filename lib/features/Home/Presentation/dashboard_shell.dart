import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/widgets/bottom_navigation_bar.dart';
import '../../../core/providers/navigation_provider.dart';
import 'Screens/homescreen.dart';
import 'widget/coming_soon_screen.dart';
import '../../categories/presentation/screen/categories.dart';

class DashboardShell extends ConsumerWidget {
  const DashboardShell({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedIndex = ref.watch(navigationIndexProvider);

    // Screens for each navigation item
    final screens = [
      const HomeScreen(), // Home
      const CategoriesScreen(), // Categories
      const ComingSoonScreen(title: 'Scan'), // Scan me
      const ComingSoonScreen(title: 'Watchlist'), // Watchlist
      const ComingSoonScreen(title: 'More'), // More
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      body: screens[selectedIndex],
      bottomNavigationBar: const AppBottomNavigationBar(),
    );
  }
}
