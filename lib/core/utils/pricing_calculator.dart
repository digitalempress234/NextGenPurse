class PricingCalculator {
  PricingCalculator._();

  /// Applies a percentage discount to a price.
  static double applyDiscount(double price, double discountPercent) {
    return price - (price * discountPercent / 100);
  }

  /// Calculates the discount amount.
  static double discountAmount(double price, double discountPercent) {
    return price * discountPercent / 100;
  }

  /// Calculates the discount percentage between original and sale price.
  static double discountPercent(double originalPrice, double salePrice) {
    if (originalPrice <= 0) return 0;
    return ((originalPrice - salePrice) / originalPrice) * 100;
  }

  /// Adds tax to a price.
  static double addTax(double price, double taxPercent) {
    return price + (price * taxPercent / 100);
  }

  /// Calculates tax amount only.
  static double taxAmount(double price, double taxPercent) {
    return price * taxPercent / 100;
  }

  /// Calculates the total for a cart — list of (price, quantity) pairs.
  static double cartTotal(List<Map<String, double>> items) {
    return items.fold(0, (sum, item) {
      final price = item['price'] ?? 0;
      final qty = item['quantity'] ?? 1;
      return sum + (price * qty);
    });
  }

  /// Formats a price with a currency symbol.
  static String format(double price, {String symbol = '₦'}) {
    return '$symbol${price.toStringAsFixed(2)}';
  }
}
