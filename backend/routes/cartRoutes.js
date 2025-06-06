import express from 'express';
import { 
    addToCart, 
    updateCart, 
    getUserCart, 
    removeFromCart, 
    clearCart,
    getCartCount 
} from '../controllers/cartController.js';
import auth from '../middleware/auth.js';

const cartRouter = express.Router();

// Apply auth middleware to all cart routes
cartRouter.post('/get', auth, getUserCart);
cartRouter.post('/add', auth, addToCart);
cartRouter.post('/update', auth, updateCart);
cartRouter.post('/remove', auth, removeFromCart);
cartRouter.post('/clear', auth, clearCart);
cartRouter.post('/count', auth, getCartCount);

export default cartRouter;