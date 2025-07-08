import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.headers.token) {
            token = req.headers.token;
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized Login Again" 
            });
        }

        try {
            // Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Log for debugging
            console.log('Admin token decoded:', decoded);
            
            // Check if the user is an admin from the token
            if (!decoded.isAdmin) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied. Admin privileges required."
                });
            }
            
            // Add the decoded token to the request
            req.user = decoded;
            
            // Allow the request to proceed
            next();
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
        }
    } catch (error) {
        console.error('Admin authentication error:', error);
        res.status(500).json({ 
            success: false, 
            message: "Server error during authentication" 
        });
    }
};

export default adminAuth;
