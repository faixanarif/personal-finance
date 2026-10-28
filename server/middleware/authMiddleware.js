import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'super_secret_jwt_key_here';

/**
 * JWT Authentication Middleware
 * Extracts Bearer token, validates against JWT_SECRET, attaches req.user
 */
export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Authorization token missing or malformed.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded; // { id, email, username }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please authenticate again.',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or corrupted token.',
    });
  }
};
