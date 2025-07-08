import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import OrderSuccess from '../components/OrderSuccess';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody, CardFooter } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CreditCard, Truck, MapPin, ChevronRight } from 'lucide-react';

const Order: React.FC = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [activeTab, setActiveTab] = useState<'shipping' | 'payment'>('shipping');
  const [orderId, setOrderId] = useState<string>('');
  const [formData, setFormData] = useState({
    address: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India', // Default value
    },
    paymentMethod: 'credit_card', // Default payment method
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    upiId: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name.includes('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user || !user.id) {
      toast.error('You must be logged in to place an order');
      setIsSubmitting(false);
      return;
    }

    // Calculate total amount including shipping and tax
    const shippingCost = 5; // $5 shipping
    const taxRate = 0.07; // 7% tax
    const totalAmount = totalPrice + shippingCost + (totalPrice * taxRate);
    
    // Validate address fields
    if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.postalCode || !formData.address.country) {
      toast.error('Please fill in all address fields');
      setIsSubmitting(false);
      return;
    }

    // Validate items
    if (!items.length) {
      toast.error('Your cart is empty');
      setIsSubmitting(false);
      return;
    }
    
    // Prepare order data according to the backend schema
    const orderData = {
      items: items.map(item => ({
        productId: item.product._id || item.product.id,
        quantity: item.quantity,
        price: item.product.price
      })),
      amount: totalAmount,
      address: {
        street: formData.address.street,
        city: formData.address.city,
        state: formData.address.state,
        postalCode: formData.address.postalCode,
        country: formData.address.country
      },
      paymentMethod: formData.paymentMethod,
      payment: formData.paymentMethod === 'COD' ? false : true,
      date: Date.now()
    };
    
    console.log('Submitting order data:', JSON.stringify(orderData, null, 2));
    
    try {
      // Make API call to the backend to place the order
      const response = await api.post('/orders/place', orderData);
      console.log('Order API response:', response.data);
      
      if (response.data.success) {
        setOrderId(response.data.orderId || '');
        setIsSubmitting(false);
        setOrderPlaced(true);
        clearCart();
        toast.success('Order placed successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Error placing order:', error);
      console.error('Error details:', error.response?.data || 'No response data');
      setIsSubmitting(false);
      toast.error(error.response?.data?.message || 'Failed to place order. Please try again.');
    }
  };

  if (orderPlaced) {
    return <OrderSuccess orderId={orderId} />;
  }

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Checkout"
        subtitle="Complete your order"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b border-gray-100">
              <div className="flex">
                <button
                  className={`flex-1 py-4 text-center font-medium ${
                    activeTab === 'shipping'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('shipping')}
                >
                  <div className="flex items-center justify-center">
                    <MapPin size={18} className="mr-2" />
                    Shipping
                  </div>
                </button>
                <button
                  className={`flex-1 py-4 text-center font-medium ${
                    activeTab === 'payment'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setActiveTab('payment')}
                >
                  <div className="flex items-center justify-center">
                    <CreditCard size={18} className="mr-2" />
                    Payment
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitOrder}>
              <CardBody>
                {activeTab === 'shipping' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="address.street"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleChange}
                          required
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="address.city"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            id="address.state"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="address.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            id="address.postalCode"
                            name="address.postalCode"
                            value={formData.address.postalCode}
                            onChange={handleChange}
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                          Country
                        </label>
                        <select
                          id="address.country"
                          name="address.country"
                          value={formData.address.country}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        >
                          <option value="India">India</option>
                          <option value="USA">United States</option>
                          <option value="UK">United Kingdom</option>
                          {/* Add more countries as needed */}
                        </select>
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button
                        type="button"
                        variant="primary"
                        onClick={() => setActiveTab('payment')}
                        className="flex items-center"
                      >
                        Continue to Payment
                        <ChevronRight size={16} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'payment' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                          Payment Method
                        </label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          value={formData.paymentMethod}
                          onChange={handleChange}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                        >
                          <option value="credit_card">Credit Card</option>
                          <option value="debit_card">Debit Card</option>
                          <option value="paypal">PayPal</option>
                          <option value="upi">UPI</option>
                          <option value="net_banking">Net Banking</option>
                          <option value="COD">Cash on Delivery</option>
                        </select>
                      </div>

                      {formData.paymentMethod === 'credit_card' || formData.paymentMethod === 'debit_card' ? (
                        <>
                          <div>
                            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                              Card Number
                            </label>
                            <input
                              type="text"
                              id="cardNumber"
                              name="cardNumber"
                              value={formData.cardNumber}
                              onChange={handleChange}
                              placeholder="1234 5678 9012 3456"
                              required
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="cardExpiry" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                id="cardExpiry"
                                name="cardExpiry"
                                value={formData.cardExpiry}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                              />
                            </div>

                            <div>
                              <label htmlFor="cardCVV" className="block text-sm font-medium text-gray-700 mb-1">
                                CVV
                              </label>
                              <input
                                type="text"
                                id="cardCVV"
                                name="cardCVV"
                                value={formData.cardCVV}
                                onChange={handleChange}
                                placeholder="123"
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                              />
                            </div>
                          </div>
                        </>
                      ) : formData.paymentMethod === 'upi' ? (
                        <div>
                          <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                            UPI ID
                          </label>
                          <input
                            type="text"
                            id="upiId"
                            name="upiId"
                            value={formData.upiId}
                            onChange={handleChange}
                            placeholder="yourname@upi"
                            required
                            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
                          />
                        </div>
                      ) : null}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setActiveTab('shipping')}
                      >
                        Back to Shipping
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="primary"
                        loading={isSubmitting}
                      >
                        Place Order
                      </Button>
                    </div>
                  </div>
                )}
              </CardBody>
            </form>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-serif text-xl font-semibold text-gray-800">Order Summary</h3>
            </div>
            
            <CardBody>
              <div className="mb-4">
                <div className="max-h-48 overflow-y-auto space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center">
                      <div className="w-12 h-12 flex-shrink-0">
                        <img 
                          src={item.product.image} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                      <div className="ml-3 flex-grow">
                        <p className="text-sm font-medium text-gray-800">{item.product.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} × ₹{item.product.price.toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
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
              <div className="flex items-center justify-center text-gray-600 text-sm">
                <Truck size={16} className="mr-2" />
                <span>Estimated delivery: 30-40 min</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Order;