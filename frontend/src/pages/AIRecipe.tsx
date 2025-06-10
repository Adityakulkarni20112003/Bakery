import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Lightbulb, Coffee, Sparkles } from 'lucide-react';

const AIRecipe: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  const [dishName, setDishName] = useState('');
  const [generatedRecipe, setGeneratedRecipe] = useState('');
  const [error, setError] = useState('');
  const [isFallback, setIsFallback] = useState(false);
  const [serviceMessage, setServiceMessage] = useState('');

  const handleAddIngredient = () => {
    if (newIngredient.trim() !== '') {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGenerateRecipe = async () => {
    if (!dishName.trim()) {
      setError('Please enter a dish name');
      return;
    }

    if (!isAuthenticated) {
      setError('You need to be logged in to generate recipes');
      return;
    }

    setError('');
    setGenerating(true);

    try {
      const response = await axios.post('/api/recipes/generate', {
        dishName: dishName.trim(),
        ingredients: ingredients.length > 0 ? ingredients : undefined
      });

      // Axios throws errors automatically for non-2xx responses
      // so we don't need to check response.ok
      
      // Axios already parses JSON responses into response.data
      setGeneratedRecipe(response.data.recipe);
      
      // Check if this is a fallback recipe
      if (response.data.fallback) {
        setIsFallback(true);
        setServiceMessage(response.data.message || 'Using a basic recipe template.');
      } else {
        setIsFallback(false);
        setServiceMessage('');
      }
      
      setGenerating(false);
      setShowRecipe(true);
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Failed to generate recipe. Please try again.');
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="AI Recipe Generator"
        subtitle="Let our AI create a unique recipe based on ingredients you have"
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dish and Ingredients Selection */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
            <Coffee size={20} className="text-primary-600" />
            <h3 className="font-serif text-xl font-semibold text-gray-800">Recipe Generator</h3>
          </div>
          <CardBody>
            <p className="text-gray-600 mb-4">
              Enter a dish name and optionally add ingredients to generate a custom recipe.
            </p>

            <div className="mb-4">
              <label htmlFor="dishName" className="block text-sm font-medium text-gray-700 mb-1">Dish Name (Required)</label>
              <input
                id="dishName"
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="Enter dish name..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
              />
            </div>

            <div className="flex mb-4">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Add an ingredient..."
                className="flex-grow rounded-l-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddIngredient();
                  }
                }}
              />
              <button
                onClick={handleAddIngredient}
                className="bg-primary-600 text-white px-4 py-2 rounded-r-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50"
              >
                Add
              </button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Current Ingredients:</h4>
              {ingredients.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm flex items-center"
                    >
                      {ingredient}
                      <button
                        onClick={() => handleRemoveIngredient(index)}
                        className="ml-1 text-primary-600 hover:text-primary-800 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No ingredients added yet.</p>
              )}
            </div>

            <div className="relative group rounded-lg overflow-hidden"> {/* Shine effect wrapper */}
              <Button
                variant="primary"
                fullWidth
                loading={generating}
                disabled={!dishName.trim() || generating}
                onClick={handleGenerateRecipe}
              >
                <Sparkles size={16} className="mr-2" />
                Generate Recipe
              </Button>
              <span className="absolute top-0 right-0 w-12 h-full bg-white/30 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
            </div>
          </CardBody>
        </Card>

        {/* Recipe Display */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-gray-100 flex items-center space-x-2">
            <Lightbulb size={20} className="text-primary-600" />
            <h3 className="font-serif text-xl font-semibold text-gray-800">Generated Recipe</h3>
          </div>
          <CardBody>
            {showRecipe ? (
              <div>
                {isFallback && serviceMessage && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">{serviceMessage}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="prose prose-sm sm:prose lg:prose-lg max-w-none">
                  {generatedRecipe.split('\n').map((line, index) => {
                    // Check if line is a section title (ends with a colon)
                    if (line.trim().endsWith(':') && line.trim().length < 30) {
                      return <h3 key={index} className="text-lg font-semibold mt-4 mb-2 text-gray-700">{line}</h3>;
                    }
                    
                    // First line is likely the recipe title
                    if (index === 0 && line.trim() !== '') {
                      return <h1 key={index} className="font-serif text-2xl font-bold mb-4 text-gray-800">{line}</h1>;
                    }
                    
                    // Check if line is a numbered step (starts with a number and period)
                    if (line.match(/^\s*\d+\.\s+/)) {
                      const match = line.match(/^\s*\d+\./); 
                      return <div key={index} className="flex mb-2">
                        <span className="font-medium mr-2">{match ? match[0] : ''}</span>
                        <span className="text-gray-600">{line.replace(/^\s*\d+\.\s+/, '')}</span>
                      </div>;
                    }
                    
                    // Regular paragraph or ingredient line
                    if (line.trim() !== '') {
                      return <p key={index} className="text-gray-600 mb-2">{line}</p>;
                    }
                    
                    // Empty line
                    return <br key={index} />;
                  })}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button variant="outline" onClick={() => {
                    setShowRecipe(false);
                    setGeneratedRecipe('');
                  }}>
                    Reset
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles size={24} className="text-primary-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-gray-800 mb-2">Your Recipe Will Appear Here</h3>
                <p className="text-gray-500">
                  Add ingredients and click "Generate Recipe" to see an AI-created recipe based on what you have available.
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default AIRecipe;