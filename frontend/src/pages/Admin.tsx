import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { Product } from '../types';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { Edit, Trash2, Plus, ShoppingBag } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const Admin: React.FC = () => {
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{id: number | string, name: string} | null>(null);

  // Debug admin status
  useEffect(() => {
    console.log('Admin component mounted, isAdmin:', isAdmin);
    console.log('Current user:', user);
    console.log('isAdmin from localStorage:', localStorage.getItem('isAdmin'));
    
    // Redirect if not admin
    if (!isAdmin) {
      console.log('Not admin, redirecting to login');
      navigate('/login');
    } else {
      console.log('Admin confirmed, staying on admin page');
    }
  }, [isAdmin, navigate, user]);

  // Fetch products
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
  }, []);

  const handleAddProduct = () => {
    // Navigate to the product form page
    navigate('/add-product');
  };

  const handleEditProduct = (id: string | number) => {
    // This would navigate to a product edit form
    alert(`Edit product with ID: ${id}`);
  };

  const handleDeleteClick = (id: number | string, name: string) => {
    setProductToDelete({ id, name });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      setLoading(true);
      console.log('Attempting to delete product with ID:', productToDelete.id);
      
      // Call the delete API
      const result = await productService.deleteProduct(productToDelete.id);
      
      if (result.success) {
        // Remove the product from the local state
        setProducts(products.filter(product => product.id !== productToDelete.id));
        toast.success('Product deleted successfully');
      } else {
        toast.error('Failed to delete product');
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setLoading(false);
      // Close the modal and reset the product to delete
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };
  
  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleViewOrders = () => {
    // Navigate to the admin orders page
    navigate('/admin-orders');
  };

  const handleRefresh = () => {
    // Refresh the products list
    setLoading(true);
    setError(null);
    productService.getProducts()
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setError('Failed to load products. Please try again later.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Admin Dashboard"
        subtitle={`Welcome back, ${user?.name || 'Admin'}`}
        action={
          <div className="flex space-x-2">
            <Button 
              variant="primary" 
              onClick={handleAddProduct}
            >
              <Plus size={16} className="mr-2" />
              Add Product
            </Button>
            <Button 
              variant="outline" 
              onClick={handleViewOrders}
            >
              <ShoppingBag size={16} className="mr-2" />
              View Orders
            </Button>
          </div>
        }
      />
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-serif text-xl font-semibold text-gray-800">Products Management</h3>
          </div>
          
          <CardBody>
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleRefresh}
                >
                  Try Again
                </Button>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No products found.</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={handleAddProduct}
                >
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Popular
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-full object-cover" 
                                src={product.image} 
                                alt={product.name} 
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-primary-100 text-primary-800">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            product.popular ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {product.popular ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEditProduct(product.id)}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(product.id, product.name)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default Admin;
