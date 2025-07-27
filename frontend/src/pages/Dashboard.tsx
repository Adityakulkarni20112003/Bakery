import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PageHeader from '../components/layout/PageHeader';
import Card, { CardBody } from '../components/ui/Card';
import Pagination from '../components/ui/Pagination';
import { ShoppingBag, Calendar, Heart, Clock, Loader } from 'lucide-react';
import { getUserOrders, formatOrderDate, getStatusBadgeColor, Order } from '../services/orderService';
import { toast } from 'react-hot-toast';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [displayedOrders, setDisplayedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(4); // Changed from 5 to 4 orders per page

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

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
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title={`Welcome, ${user?.name}!`}
        subtitle="Here's an overview of your activity"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <ShoppingBag size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Cart Items</p>
              <p className="text-2xl font-bold text-gray-800">{totalItems}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Orders Placed</p>
              <p className="text-2xl font-bold text-gray-800">{orders.length}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Heart size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Favorites</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Clock size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-gray-500 text-sm">Points Earned</p>
              <p className="text-2xl font-bold text-gray-800">0</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-serif text-xl font-semibold text-gray-800">Recent Orders</h3>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader size={24} className="animate-spin text-primary-600 mr-2" />
                  <span className="text-gray-600">Loading orders...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Try again
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <Link
                    to="/products"
                    className="mt-2 inline-block text-primary-600 hover:text-primary-800 text-sm font-medium"
                  >
                    Browse products
                  </Link>
                </div>
              ) : (
                <table className="min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-4 py-3 text-sm text-gray-900">#{order._id.substring(0, 6)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{formatOrderDate(order.date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₹{order.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Pagination */}
              {orders.length > itemsPerPage && (
                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(orders.length / itemsPerPage)}
                    onPageChange={handlePageChange}
                    totalItems={orders.length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              )}
              <div className="mt-4 text-right">
                <Link
                  to="/orders"
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  View all orders
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Links */}
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-serif text-xl font-semibold text-gray-800">Quick Actions</h3>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/products" 
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingBag size={20} className="text-primary-600" />
                    <span className="font-medium">Shop Products</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/cart" 
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingBag size={20} className="text-primary-600" />
                    <span className="font-medium">View Cart</span>
                  </div>
                </Link>
              </li>
              <li>
                <Link 
                  to="/ai-recipe" 
                  className="block p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar size={20} className="text-primary-600" />
                    <span className="font-medium">AI Recipe Generator</span>
                  </div>
                </Link>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;