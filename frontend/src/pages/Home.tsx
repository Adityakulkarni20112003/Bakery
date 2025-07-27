import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { testimonials } from '../data/testimonials';
import { productService } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/ui/ProductCard';
import TestimonialCard from '../components/ui/TestimonialCard';
import Button from '../components/ui/Button';
import { ArrowRight, Cake, Utensils, Award, Clock, Loader } from 'lucide-react';

const Home: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth(); // Get both user object and authentication status
  
  // Fetch products from the backend when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    setIsMounted(true);
  }, []);
  
  // Get only popular products
  const popularProducts = products.filter(product => product.popular);
  
  return (
    <div className={`transition-opacity duration-1000 ease-in-out ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Hero Section */}
      <section className="relative bg-bread-pattern bg-cover bg-center py-24 md:py-32">
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
              Handcrafted Baked Goods Made With Love
            </h1>
            <p className="text-xl text-gray-100 mb-6">
              From artisan breads to decadent pastries, we bake fresh daily using only the finest ingredients.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="relative inline-block overflow-hidden group rounded-lg">
                <Button size="lg" onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>
                  Explore Our Products
                </Button>
                <span className="absolute top-0 right-0 w-12 h-full bg-white/10 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
              </div>
              {!isAuthenticated && (
                <Link to="/login">
                  <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary-600">
                    Sign In to Order
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cake size={32} className="text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Artisan Baking</h3>
              <p className="text-gray-600">Crafted with traditional methods and attention to detail.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils size={32} className="text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Quality Ingredients</h3>
              <p className="text-gray-600">Locally sourced, organic ingredients for superior flavor.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Award Winning</h3>
              <p className="text-gray-600">Recognized for excellence in baking and customer service.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-card text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock size={32} className="text-primary-600" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">Fresh Daily</h3>
              <p className="text-gray-600">Baked fresh every morning for maximum freshness.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Popular Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-gray-800">Our Popular Products</h2>
              <p className="text-gray-600 mt-2">Customer favorites that keep people coming back</p>
            </div>
            <Link to="/products" className="mt-4 md:mt-0 flex items-center text-primary-600 hover:text-primary-700">
              <span className="font-medium">View All Products</span>
              <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader size={40} className="animate-spin text-primary-500" />
              <span className="ml-3 text-lg text-gray-600">Loading products...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg">{error}</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : popularProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularProducts.slice(0, 6).map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No popular products available at the moment.</p>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">Ready to Experience Our Delicious Creations?</h2>
          <p className="text-primary-100 mb-8 max-w-3xl mx-auto">
            Sign up for an account to place orders, save your favorites, and access our AI recipe generator.
          </p>
          {!isAuthenticated && (
            <Link to="/login" className="inline-block"> {/* Ensure inline-block for text-center to work */}
              <div className="relative inline-block overflow-hidden group rounded-lg"> {/* Shine effect wrapper */}
                <Button 
                  variant="secondary" 
                  size="lg" 
                  className="text-white font-medium"
                >
                  Create an Account
                </Button>
                {/* Shine element - increased opacity for potentially better visibility */}
                <span className="absolute top-0 right-0 w-12 h-full bg-white/30 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
              </div>
            </Link>
          )}
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 bg-cream">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-gray-800 mb-2">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it. Here's what our satisfied customers have to say about our baked goods.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;