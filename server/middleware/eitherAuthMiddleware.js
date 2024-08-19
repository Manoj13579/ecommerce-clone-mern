import { authenticateToken } from './authMiddleware.js';
import { googleAuthMiddleware } from './googleAuthMiddleware.js';

// Middleware to handle either token or Google authentication
const eitherAuthMiddleware = (req, res, next) => {
  // Try token-based authentication first
  googleAuthMiddleware(req, res, (err) => {
    if (!err) {
      // if googleAuthMiddleware defined in middleware throws no error Token authentication succeeded
      return next();
    }

    // If token-based authentication failed, try Google authentication
    authenticateToken(req, res, (err) => {
      if (!err) {
        //authenticate token succeeded
        return next();
      }

      // Both token-based and Google authentication failed
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    });
  });
};

export default eitherAuthMiddleware;