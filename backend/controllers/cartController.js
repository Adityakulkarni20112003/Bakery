import userModel from "../models/userModel.js";
import mongoose from "mongoose";

// Add product to user cart
const addToCart = async (req, res) => {
    try {
        // Get user from auth middleware and item details from request body
        const { itemId, quantity = 1 } = req.body;
        const userData = req.user; // User is already authenticated by auth middleware

        // Validate required fields
        if (!itemId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item ID is required' 
            });
        }

        // Validate quantity
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 1) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be a positive number' 
            });
        }

        // User is already validated by auth middleware
        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }
        
        let cartData = userData.cartData || {};

        // Add or update item quantity in cart
        if (cartData[itemId]) {
            cartData[itemId] += qty;
        } else {
            cartData[itemId] = qty;
        }
        
        // Update user cart in database using the user's ID from the authenticated user object
        const updateResult = await userModel.findByIdAndUpdate(userData._id, { cartData }, { new: true });
        res.json({ 
            success: true, 
            message: 'Item added to cart successfully',
            cartData 
        });

    } catch (error) {
        console.error('addToCart error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Update product quantity in user cart
const updateCart = async (req, res) => {
    try {
        // Get user from auth middleware and item details from request body
        const { itemId, quantity } = req.body;
        const userData = req.user; // User is already authenticated by auth middleware

        // Validate required fields
        if (!itemId || quantity === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item ID and quantity are required' 
            });
        }

        // Validate quantity
        const qty = parseInt(quantity);
        if (isNaN(qty) || qty < 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Quantity must be a non-negative number' 
            });
        }

        // User is already validated by auth middleware
        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        let cartData = userData.cartData || {};

        // Remove item if quantity is 0, otherwise update quantity
        if (qty === 0) {
            delete cartData[itemId];
        } else {
            cartData[itemId] = qty;
        }

        // Update user cart in database using the user's ID from the authenticated user object
        const updateResult = await userModel.findByIdAndUpdate(userData._id, { cartData }, { new: true });

        res.json({ 
            success: true, 
            message: qty === 0 ? 'Item removed from cart' : 'Cart updated successfully',
            cartData 
        });

    } catch (error) {
        console.error('updateCart error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        // Get user from auth middleware and item details from request body
        const { itemId } = req.body;
        const userData = req.user; // User is already authenticated by auth middleware

        // Validate required fields
        if (!itemId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Item ID is required' 
            });
        }

        // User is already validated by auth middleware
        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }

        let cartData = userData.cartData || {};

        // Remove item from cart
        if (cartData[itemId]) {
            delete cartData[itemId];
            
            // Update user cart in database using the user's ID from the authenticated user object
            const updateResult = await userModel.findByIdAndUpdate(userData._id, { cartData }, { new: true });
            
            res.json({ 
                success: true, 
                message: 'Item removed from cart successfully',
                cartData 
            });
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Item not found in cart' 
            });
        }

    } catch (error) {
        console.error('removeFromCart error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Get user cart data
const getUserCart = async (req, res) => {
    try {
        // Get userId from request body or from authenticated user
        let userId = req.body && req.body.userId;
        
        // If no userId in request body, use authenticated user's ID
        if (!userId && req.user) {
            userId = req.user._id;
        }

        // Validate required field
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User ID is required' 
            });
        }
        
        // Find user
        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }
        
        // Get cart data from user document
        const cartData = userData.cartData || {};
        
        // Ensure the cart data is in the format expected by the frontend
        // The frontend expects an object with product IDs as keys and quantities as values
        // This is already how it's stored in the database, so we can just return it directly
        res.json({ 
            success: true, 
            cartData
        });

    } catch (error) {
        console.error('getUserCart error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Clear entire cart
const clearCart = async (req, res) => {
    try {
        // Get user from auth middleware
        const userData = req.user; // User is already authenticated by auth middleware

        // User is already validated by auth middleware
        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }
        
        // Clear cart using the user's ID from the authenticated user object
        const updateResult = await userModel.findByIdAndUpdate(userData._id, { cartData: {} }, { new: true });
        
        res.json({ 
            success: true, 
            message: 'Cart cleared successfully',
            cartData: {} 
        });

    } catch (error) {
        console.error('clearCart error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Get cart item count
const getCartCount = async (req, res) => {
    try {
        // Get user from auth middleware
        const userData = req.user; // User is already authenticated by auth middleware

        // User is already validated by auth middleware
        if (!userData) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required' 
            });
        }


        const cartData = userData.cartData || {};
        
        // Calculate total items in cart
        const totalItems = Object.values(cartData).reduce((total, quantity) => total + quantity, 0);

        res.json({ 
            success: true, 
            count: totalItems,
            uniqueItems: Object.keys(cartData).length 
        });

    } catch (error) {
        console.error('getCartCount error:', error);
        res.status(500).json({ 
            success: false, 
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

export { 
    addToCart, 
    updateCart, 
    removeFromCart, 
    getUserCart, 
    clearCart, 
    getCartCount 
};