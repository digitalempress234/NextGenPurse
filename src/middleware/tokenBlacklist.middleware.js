// Simple in-memory token blacklist for logout functionality
// For production, use Redis or database-backed blacklist
const blacklistedTokens = new Set();
const tokenExpirations = new Map(); // Track expiration times for cleanup

// Add token to blacklist
export const blacklistToken = (token, expiresAt) => {
  blacklistedTokens.add(token);
  tokenExpirations.set(token, expiresAt);
  
  // Schedule cleanup after token expires
  setTimeout(() => {
    blacklistedTokens.delete(token);
    tokenExpirations.delete(token);
  }, expiresAt - Date.now());
};

// Check if token is blacklisted
export const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

// Middleware to check if token is blacklisted
export const checkTokenBlacklist = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({
        message: 'Token has been invalidated. Please login again.'
      });
    }
  }
  
  next();
};

// Cleanup expired tokens (run periodically)
setInterval(() => {
  const now = Date.now();
  for (const [token, expiresAt] of tokenExpirations.entries()) {
    if (expiresAt < now) {
      blacklistedTokens.delete(token);
      tokenExpirations.delete(token);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

export default { blacklistToken, isTokenBlacklisted, checkTokenBlacklist };