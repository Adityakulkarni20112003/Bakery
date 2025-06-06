import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Loader, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { getAllOrders, formatOrderDate, getStatusBadgeColor, Order, updateOrderStatus, sendInvoiceEmail } from '../services/orderService';
import { toast } from 'react-hot-toast';

const AdminOrders: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/login');
      return;
    }
    
    fetchOrders();
  }, [isAdmin, navigate]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await getAllOrders();
      
      if (response.success && response.orders) {
        // Sort orders by date (newest first)
        const sortedOrders = [...response.orders].sort((a, b) => b.date - a.date);
        setAllOrders(sortedOrders);
        
        // Calculate pagination
        updatePaginatedOrders(sortedOrders, 1);
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
  
  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePaginatedOrders(allOrders, page);
  };
  
  // Update orders based on pagination
  const updatePaginatedOrders = (allOrdersData: Order[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedOrders = allOrdersData.slice(startIndex, endIndex);
    setOrders(paginatedOrders);
    setCurrentPage(page);
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
    } else {
      setExpandedOrderId(orderId);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      // Don't update if the status hasn't changed
      const currentOrder = orders.find(order => order._id === orderId);
      if (currentOrder?.status === newStatus) {
        console.log('Status unchanged, skipping update');
        return;
      }
      
      console.log(`Updating order ${orderId} status to: ${newStatus}`);
      setUpdatingOrderId(orderId);
      
      const response = await updateOrderStatus(orderId, newStatus);
      console.log('Update response:', response);
      
      if (response.success) {
        // Update the order status in both the paginated and all orders arrays
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        
        setAllOrders(allOrders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        
        toast.success('Order status updated successfully');
      } else {
        console.error('Failed to update status:', response.message);
        toast.error(response.message || 'Failed to update order status');
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('An error occurred while updating the order status');
    } finally {
      setUpdatingOrderId(null);
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

  const statusOptions = [
    'Order Placed',
    'Processing',
    'Shipped',
    'Delivered',
    'Cancelled'
  ];
  
  // Log for debugging
  console.log('Current orders:', orders);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <PageHeader 
          title="Manage Orders"
          subtitle="View and update all customer orders"
        />
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center text-primary-600 border border-primary-600 rounded-md px-4 py-2 hover:bg-primary-50 transition-colors"
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Back to Admin</span>
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <Loader size={32} className="animate-spin text-primary-600 mr-3" />
          <span className="text-lg text-gray-600">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={fetchOrders} 
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          >
            Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-4">No orders found in the system.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
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
                  <p className="text-sm text-gray-500 mt-1">
                    {formatOrderDate(order.date)} • ₹{order.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-500 mr-2">
                    {expandedOrderId === order._id ? 'Hide Details' : 'View Details'}
                  </span>
                  {expandedOrderId === order._id ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </div>
              </div>
              
              {expandedOrderId === order._id && (
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Order ID:</span>
                          <span className="text-gray-900">{order._id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">User ID:</span>
                          <span className="text-gray-900">{order.userId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Date:</span>
                          <span className="text-gray-900">{formatOrderDate(order.date)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Total Amount:</span>
                          <span className="text-gray-900 font-medium">₹{order.amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-500 font-medium">Status:</span>
                          <div className="relative w-2/3">
                            <div className={`absolute -left-8 top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full ${getStatusBadgeColor(order.status).split(' ')[0]}`}></div>
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              disabled={updatingOrderId === order._id}
                              className={`block w-full pl-3 pr-10 py-2 text-sm font-medium border-2 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${getStatusBadgeColor(order.status)}`}
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                            {updatingOrderId === order._id && (
                              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                <Loader size={14} className="animate-spin text-primary-600" />
                              </div>
                            )}
                          </div>
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
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Customer Actions</h4>
                      <div className="space-y-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          fullWidth
                          onClick={async () => {
                            try {
                              const response = await sendInvoiceEmail(order._id);
                              if (response.success) {
                                toast.success('Invoice sent successfully to customer');
                              } else {
                                throw new Error(response.message || 'Failed to send email');
                              }
                            } catch (error) {
                              console.error('Error sending email notification:', error);
                              toast.error('Failed to send email notification. Please try again.');
                            }
                          }}
                        >
                          Send Email Notification
                        </Button>
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
                              <td className="px-4 py-3 text-sm text-gray-900">Product ID: {item.productId}</td>
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
                </CardBody>
              )}
            </Card>
          ))}
          
          {/* Pagination */}
          {allOrders.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(allOrders.length / itemsPerPage)}
              onPageChange={handlePageChange}
              totalItems={allOrders.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
