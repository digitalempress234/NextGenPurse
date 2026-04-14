class UrlHelper {
  UrlHelper._();

  /// Appends query parameters to a base URL.
  static String withParams(String baseUrl, Map<String, dynamic> params) {
    if (params.isEmpty) return baseUrl;
    final query = params.entries
        .map((e) =>
            '${Uri.encodeComponent(e.key)}=${Uri.encodeComponent(e.value.toString())}')
        .join('&');
    final separator = baseUrl.contains('?') ? '&' : '?';
    return '$baseUrl$separator$query';
  }

  /// Returns true if the string is a valid URL.
  static bool isValid(String url) {
    final uri = Uri.tryParse(url);
    return uri != null && (uri.scheme == 'http' || uri.scheme == 'https');
  }

  /// Returns true if the URL points to an image.
  static bool isImage(String url) {
    final lower = url.toLowerCase();
    return lower.endsWith('.jpg') ||
        lower.endsWith('.jpeg') ||
        lower.endsWith('.png') ||
        lower.endsWith('.gif') ||
        lower.endsWith('.webp');
  }

  /// Extracts the filename from a URL path.
  static String fileName(String url) {
    return Uri.parse(url).pathSegments.last;
  }

  /// Joins a base URL and a path safely.
  static String join(String base, String path) {
    final cleanBase = base.endsWith('/') ? base.substring(0, base.length - 1) : base;
    final cleanPath = path.startsWith('/') ? path : '/$path';
    return '$cleanBase$cleanPath';
  }
}
