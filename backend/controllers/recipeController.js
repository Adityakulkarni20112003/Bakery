import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Google Generative AI with API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);

// Helper function to wait between retries
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// @desc    Generate recipe using Gemini AI
// @route   POST /api/recipes/generate
// @access  Public
const generateRecipe = async (req, res) => {
  try {
    const { dishName, ingredients } = req.body;

    if (!dishName) {
      return res.status(400).json({ message: 'Dish name is required' });
    }

    // Configure the model - using gemini-2.0-flash as specified
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Create prompt based on available information
    let prompt = `Generate a detailed recipe for ${dishName}.`;
    
    if (ingredients && ingredients.length > 0) {
      prompt += ` Use the following ingredients: ${ingredients.join(', ')}.`;
    }
    
    prompt += ` Format the response in plain text (no markdown, no asterisks) with the following structure:
    - Start with the dish name as a title
    - Then a section titled "Ingredients:" with each ingredient on a new line with measurements
    - Then a section titled "Instructions:" with numbered steps
    - Finally, a section titled "Notes:" with any additional information
    
    Do not use any special formatting characters like asterisks, hashes, or markdown syntax. Just use plain text with clear section titles.`;

    // Try to generate content with retries
    let retries = 3;
    let text = null;
    let error = null;
    
    while (retries > 0 && !text) {
      try {
        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = response.text();
        break; // Success, exit the loop
      } catch (err) {
        error = err;
        console.log(`Attempt failed, ${retries - 1} retries left. Error: ${err.message}`);
        
        // If it's a 503 error (service overloaded), wait and retry
        if (err.status === 503) {
          retries--;
          if (retries > 0) {
            // Wait longer between each retry (exponential backoff)
            await sleep(2000 * (4 - retries)); 
            continue;
          }
        } else {
          // For other errors, don't retry
          break;
        }
      }
    }
    
    // If we got a successful response
    if (text) {
      res.status(200).json({ recipe: text });
    } 
    // If all retries failed or we got a non-503 error, use fallback
    else {
      // Provide a fallback response
      const fallbackRecipe = generateFallbackRecipe(dishName, ingredients);
      res.status(200).json({ 
        recipe: fallbackRecipe,
        fallback: true,
        message: "The AI service is currently busy. We've provided a basic recipe template instead."
      });
    }
  } catch (error) {
    console.error('Error generating recipe:', error);
    res.status(500).json({ message: 'Failed to generate recipe', error: error.message });
  }
};

// Fallback function to generate a basic recipe when the API is unavailable
const generateFallbackRecipe = (dishName, ingredients = []) => {
  const capitalizedDishName = dishName.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  let recipe = `${capitalizedDishName}\n\n`;
  
  recipe += "Ingredients:\n";
  if (ingredients && ingredients.length > 0) {
    ingredients.forEach(ingredient => {
      recipe += `- ${ingredient}\n`;
    });
  } else {
    recipe += "- [Main ingredients based on the dish]\n";
    recipe += "- [Additional ingredients as needed]\n";
  }
  
  recipe += "\nInstructions:\n";
  recipe += "1. Prepare all ingredients as needed (washing, chopping, etc.)\n";
  recipe += "2. [First step of preparation]\n";
  recipe += "3. [Main cooking process]\n";
  recipe += "4. [Final steps]\n";
  recipe += "5. Serve and enjoy!\n";
  
  recipe += "\nNotes:\n";
  recipe += "This is a basic recipe template. For a more detailed recipe, please try again later when our AI service is available.\n";
  
  return recipe;
};

export { generateRecipe };
