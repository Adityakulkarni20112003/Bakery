import express from 'express';
const router = express.Router();
import { generateRecipe } from '../controllers/recipeController.js';
import auth from '../middleware/auth.js';

// Route to generate a recipe
router.post('/generate', auth , generateRecipe);

export default router;
