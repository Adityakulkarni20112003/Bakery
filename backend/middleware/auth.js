import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// Authentication middleware to protect routes
const auth = async (req, res, next) => {
    try {
        // Get token from Authorization header
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.headers.token) {
            token = req.headers.token;
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Not authorized, no token' 
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Add user data to request object
            if (decoded.id) {
                // Find user by ID
                const user = await userModel.findById(decoded.id);
                
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: 'User not found'
                    });
                }
                
                // Add user to request object
                req.user = user;
                next();
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token'
                });
            }
        } catch (error) {
            console.error('Token verification error:', error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    } catch (error) {
        console.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

export default auth;