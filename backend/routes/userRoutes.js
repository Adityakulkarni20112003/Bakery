import express from 'express';
import { loginUser, registerUser, adminLogin, findUserByEmail, getCurrentUser } from '../controllers/userController.js';
import auth from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/find-by-email', findUserByEmail);
// Route to verify token and get current user
userRouter.get('/me', auth, getCurrentUser);

export default userRouter;