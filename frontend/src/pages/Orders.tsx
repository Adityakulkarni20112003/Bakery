import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { Loader, ChevronDown, ChevronUp, ExternalLink, ArrowLeft } from 'lucide-react';
import { getUserOrders, formatOrderDate, getStatusBadgeColor, Order, downloadInvoice } from '../services/orderService';
import { toast } from 'react-hot-toast';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        return;
      }
      
      try {
        setLoading(true);
        const response = await getUserOrders();
        
        if (response.success && response.orders) {
          // Sort orders by date (newest first)
          const sortedOrders = [...response.orders].sort((a, b) => b.date - a.date);
          setOrders(sortedOrders);
        } else {
          setError(response.message || 'Failed to fetch orders');
          toast.error(response.message || 'Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An unexpected error occurred');
        toast.error('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [user]);
  
  // Update displayed orders when all orders change or page changes
  useEffect(() => {
    updatePaginatedOrders(currentPage);
  }, [orders, currentPage]);
  
  // Function to update the paginated orders
  const updatePaginatedOrders = (page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedOrders(orders.slice(startIndex, endIndex));
  };
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedOrderId(null); // Close any expanded order when changing pages
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const getPaymentMethodLabel = (method: string): string => {
    const methodMap: { [key: string]: string } = {
      'credit_card': 'Credit Card',
      'debit_card': 'Debit Card',
      'paypal': 'PayPal',
      'upi': 'UPI',
      'net_banking': 'Net Banking',
      'cod': 'Cash on Delivery',
      'COD': 'Cash on Delivery'
    };
    
    return methodMap[method] || method;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="My Orders"
          subtitle="View and track your order history"
        />
        <div className="relative inline-block overflow-hidden group rounded-md"> {/* Shine effect wrapper */}
          <Link 
            to="/dashboard" 
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader size={32} className="animate-spin text-primary-600 mr-3" />
          <span className="text-lg text-gray-600">Loading your orders...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">{error}</p>
          <div className="relative inline-block overflow-hidden group rounded-md mt-4"> {/* Shine effect wrapper, mt-4 moved here */}
            <button 
              onClick={() => window.location.reload()} // This will trigger fetchOrders again
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Try Again
            </button>
            <span className="absolute top-0 right-0 w-12 h-full bg-white/20 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">You haven't placed any orders yet.</p>
          <a 
            href="/products" 
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Browse Products
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => (
            <Card key={order._id} className="overflow-hidden">
              <div 
                className="p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleOrderDetails(order._id)}
              >
                <div>
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900">Order #{order._id.substring(0, 6)}</h3>
                    <span className={`ml-3 px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{formatOrderDate(order.date)}</p>
                </div>
                <div className="flex items-center">
                  <p className="font-semibold text-gray-900 mr-4">₹{order.amount.toFixed(2)}</p>
                  {expandedOrderId === order._id ? (
                    <ChevronUp size={20} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedOrderId === order._id && (
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="text-gray-900">{order._id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">{formatOrderDate(order.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Status:</span>
                          <span className="text-gray-900">{order.status}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Method:</span>
                          <span className="text-gray-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Payment Status:</span>
                          <span className="text-gray-900">{order.payment ? 'Paid' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                      <div className="text-gray-700">
                        <p>{order.address.street}</p>
                        <p>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                        <p>{order.address.country}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-gray-900 mb-2">Order Items</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {item.productName || `Product ${item.productId.substring(0, 6)}...`}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{item.price.toFixed(2)}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 text-right">₹{(item.price * item.quantity).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50">
                            <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Total Amount:</td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">₹{order.amount.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <div className="relative inline-block overflow-hidden group rounded-md"> {/* Shine effect wrapper */}
                      <button 
                        className="flex items-center text-primary-600 hover:text-primary-800 px-4 py-2 border border-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                        onClick={() => {
                        try {
                          downloadInvoice(order._id);
                          toast.success('Invoice download started');
                        } catch (err) {
                          console.error('Error downloading invoice:', err);
                          toast.error('Failed to download invoice. Please try again.');
                        }
                      }}
                    >
                      <ExternalLink size={16} className="mr-1" />
                      <span>Download Invoice</span>
                      </button>
                      <span className="absolute top-0 right-0 w-12 h-full bg-primary-600/10 skew-x-[-20deg] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out pointer-events-none"></span>
                    </div>
                  </div>
                </CardBody>
              )}
            </Card>
          ))}
          
          {/* Pagination */}
          {orders.length > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(orders.length / itemsPerPage)}
                onPageChange={handlePageChange}
                totalItems={orders.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;
