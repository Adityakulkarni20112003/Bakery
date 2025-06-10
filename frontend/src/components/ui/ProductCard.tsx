import React from 'react';
import { Product } from '../../types';
import Card from './Card';
import Button from './Button';
import { useCart } from '../../context/CartContext';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showAddToCart = true,
  className = '' 
}) => {
  const { addToCart } = useCart();
  
  return (
    <Card hover className={`h-full flex flex-col ${className}`}>
      <div className="relative h-48 overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
        />
        {product.popular && (
          <div className="absolute top-2 right-2 bg-accent-600 text-white text-xs font-bold px-2 py-1 rounded">
            Popular
          </div>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-serif text-lg font-semibold text-gray-800">{product.name}</h3>
          <p className="font-sans font-bold text-primary-600">₹{product.price.toFixed(2)}</p>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 flex-grow">{product.description}</p>
        
        {showAddToCart && (
          <div className="relative mt-auto group rounded-lg overflow-hidden"> {/* Shine effect wrapper, mt-auto moved here */}
            <Button 
              variant="primary" 
              onClick={() => addToCart(product)}
              fullWidth /* Ensure button fills the wrapper for consistent effect */
            >
              <ShoppingBag size={16} className="mr-2" />
              Add to Cart
            </Button>
            <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;