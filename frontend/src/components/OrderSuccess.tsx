import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from './ui/Button';

interface OrderSuccessProps {
  orderId?: string;
}

const OrderSuccess: React.FC<OrderSuccessProps> = ({ orderId }) => {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-green-600" />
        </div>
        <h2 className="font-serif text-2xl font-semibold text-gray-800 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your order. We've sent a confirmation email with all the details.
        </p>
        {orderId && (
          <p className="text-gray-600 mb-6">
            Your order number is: <span className="font-semibold">#{orderId}</span>
          </p>
        )}
        <div className="space-y-4">
          <Button 
            variant="primary" 
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            View My Orders
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
