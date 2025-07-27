import api from './api';
import { Product } from '../types';

interface ProductsResponse {
  success: boolean;
  products: Product[];
}

export const productService = {
  /**
   * Fetch all products from the backend
   * @returns Promise with the products array
   */
  getProducts: async (): Promise<Product[]> => {
    try {
      const response = await api.get<ProductsResponse>('/products/list');
      
      // Map MongoDB _id to frontend id
      const mappedProducts = response.data.products.map(product => {
        // Ensure we always have a valid id (string or number)
        const id = product._id ? product._id : `temp-${Date.now()}`;
        
        return {
          id: id,
          _id: product._id,
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          category: product.category,
          popular: product.popular
        };
      });
      
      return mappedProducts;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Provide more specific error messages based on the error type
      if (error.code === 'ECONNABORTED') {
        throw new Error('Connection timeout. Please check your internet connection and try again.');
      } else if (error.message === 'Network Error') {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw new Error(`Server error: ${error.response.data.message || 'Unknown error'}`);
      } else {
        throw error;
      }
    }
  },

  /**
   * Fetch a single product by ID
   * @param id Product ID
   * @returns Promise with the product
   */
  getProductById: async (id: number): Promise<Product> => {
    try {
      const response = await api.get<{ success: boolean; product: Product }>(`/products/single/${id}`);
      return response.data.product;
    } catch (error) {
      console.error(`Error fetching product with ID ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new product
   * @param productData Product data to create
   * @returns Promise with the created product
   */
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await api.post<{ success: boolean; product: Product }>('/products/create', productData);
      return response.data.product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  /**
   * Create a new product with image upload
   * @param formData FormData containing product data and image file
   * @returns Promise with the created product
   */
  createProductWithImage: async (formData: FormData): Promise<Product> => {
    try {
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await api.post<{ success: boolean; product: Product }>('/products/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'token': token || '' // Include the token in the request headers
        }
      });
      return response.data.product;
    } catch (error) {
      console.error('Error creating product with image:', error);
      throw error;
    }
  },

  /**
   * Delete a product by ID
   * @param id Product ID to delete
   * @returns Promise with success status and message
   */
  deleteProduct: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    try {
      // Log the ID for debugging
      console.log('Deleting product with ID:', id);
      
      // Get the authentication token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await api.delete<{ success: boolean; message: string }>(`/products/remove/${id}`, {
        headers: {
          'token': token || '' // Include the token in the request headers
        }
      });
      console.log('Delete response:', response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product with ID ${id}:`, error);
      throw error;
    }
  }
};
