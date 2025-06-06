import React, { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import { Product } from '../types';
import ProductCard from '../components/ui/ProductCard';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Pagination from '../components/ui/Pagination';
import { Search, Filter, Loader } from 'lucide-react';

type CategoryType = 'all' | 'bread' | 'pastry' | 'cake' | 'cookie' | 'muffin' | 'pie';

const Products: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<CategoryType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8); // Show 8 products per page (2x4 grid)
  
  const categories: { label: string; value: CategoryType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Bread', value: 'bread' },
    { label: 'Pastries', value: 'pastry' },
    { label: 'Cakes', value: 'cake' },
    { label: 'Cookies', value: 'cookie' },
    { label: 'Muffins', value: 'muffin' },
    { label: 'Pies', value: 'pie' },
  ];
  
  // Fetch products from the backend when component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productService.getProducts();
        setAllProducts(data);
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

  // Filter products when category, search term, or all products change
  useEffect(() => {
    const filteredProducts = allProducts.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    // Reset to first page when filters change
    setCurrentPage(1);
    
    // Update pagination
    updatePaginatedProducts(filteredProducts, 1);
  }, [activeCategory, searchTerm, allProducts]);

  // Function to handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    
    // Get filtered products
    const filteredProducts = allProducts.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    
    updatePaginatedProducts(filteredProducts, page);
  };
  
  // Update products based on pagination
  const updatePaginatedProducts = (filteredProducts: Product[], page: number) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    setDisplayedProducts(paginatedProducts);
  };
  
  // Get filtered products for pagination calculation
  const getFilteredProducts = () => {
    return allProducts.filter(product => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  };
  
  const filteredProducts = getFilteredProducts();
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader 
        title="Our Products"
        subtitle="Explore our wide range of fresh baked goods"
      />
      
      <div className="flex flex-col md:flex-row md:items-center mb-8 space-y-4 md:space-y-0">
        {/* Search */}
        <div className="flex-grow md:max-w-md">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
            />
            <Search size={20} className="text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        
        {/* Categories Filter */}
        <div className="md:ml-4 flex items-center">
          <Filter size={20} className="text-gray-500 mr-2 hidden md:block" />
          <span className="text-gray-500 mr-2 hidden md:block">Filter:</span>
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={activeCategory === category.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
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
      ) : filteredProducts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
            />
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setActiveCategory('all');
              setSearchTerm('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Products;
