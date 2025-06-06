import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Trash2, Plus, Minus, ShoppingBag, Loader } from 'lucide-react';


const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice, clearCart, isLoading } = useCart();
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    navigate('/order');
  };
  
  // Show loading spinner when cart operations are in progress
  const renderLoadingOverlay = () => {
    if (isLoading) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg flex items-center">
            <Loader className="animate-spin mr-2" size={20} />
            <span>Processing...</span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageHeader 
          title="Your Cart"
          subtitle="Review and modify your selected items"
        />
        
        <div className="bg-white rounded-lg shadow-card p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={24} className="text-gray-400" />
          </div>
          <h2 className="font-serif text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">
            You haven't added any items to your cart yet.
          </p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/products')}
          >
            Browse Products
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      {renderLoadingOverlay()}
      <PageHeader 
        title="Your Cart"
        subtitle="Review and modify your selected items"
        action={
          <Button variant="outline" onClick={clearCart} disabled={isLoading}>
            <Trash2 size={16} className="mr-2" />
            Clear Cart
          </Button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-serif text-xl font-semibold text-gray-800">Cart Items ({items.length})</h3>
            </div>
            
            <div>
              {items.map((item) => (
                <div key={item.product.id} className="p-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-24 sm:h-24 mb-4 sm:mb-0">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-grow sm:ml-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div>
                          <h4 className="font-serif text-lg font-semibold text-gray-800">{item.product.name}</h4>
                          <p className="text-gray-500 text-sm">₹{item.product.price.toFixed(2)} each</p>
                        </div>
                        <div className="mt-2 sm:mt-0 text-right">
                          <p className="font-semibold text-primary-600">
                            ₹{(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                            disabled={isLoading}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="mx-3 min-w-[24px] text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600"
                            disabled={isLoading}
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          disabled={isLoading}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-serif text-xl font-semibold text-gray-800">Order Summary</h3>
            </div>
            
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹{5.00.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span className="font-medium">₹{(totalPrice * 0.07).toFixed(2)}</span>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-800">Total</span>
                    <span className="font-bold text-primary-600">
                      ₹{(totalPrice + 5 + (totalPrice * 0.07)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
            
            <CardFooter>
              <Button 
                variant="primary" 
                fullWidth
                onClick={handleCheckout}
                disabled={isLoading}
              >
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Cart;