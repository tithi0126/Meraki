const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Access denied. Admin only.' 
        });
    }
    next();
};

const isAuthenticated = (req, res, next) => {
    req.isAuthenticated = !!req.session.user;
    req.isAdmin = req.session.user && req.session.user.role === 'admin';
    next();
};

module.exports = { requireAuth, requireAdmin, isAuthenticated };
