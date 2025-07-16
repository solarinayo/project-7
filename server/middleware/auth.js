const jwt = require('jsonwebtoken');

const authenticateAdmin = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = {
  authenticateAdmin
};