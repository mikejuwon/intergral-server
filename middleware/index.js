// middleware for checking if user is logged in

const log = require('../config/logger');
const jwt = require('jsonwebtoken');

const checkAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userData = decoded;
        next();
    } catch (error) {
        log.error(`Error: ${error.message}`);
        return res.status(401).json({ success: false, message: 'Authentication failed' });
    }
}

module.exports = checkAuth;