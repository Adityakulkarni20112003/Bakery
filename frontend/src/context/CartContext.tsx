import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import * as cartService from '../services/cartService';
// Import the api module from the correct location
import api from '../services/api';

// Define a function to fetch products directly
const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get('/products/list');
    
    // Map MongoDB _id to frontend id
    const mappedProducts = response.data.products.map((product: any) => {
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
    throw error;
  }
};

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number | string) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user, isAuthenticated } = useAuth();
  
  // Load cart data when user logs in
  useEffect(() => {
    const fetchCartData = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated && user) {
          console.log('User is authenticated:', user);
          
          // Get cart data from backend using JWT token for authentication
          console.log('Fetching cart data from backend...');
          const response = await cartService.getUserCart();
          console.log('Cart data response from backend:', response);
          
          if (response.success && response.cartData) {
            console.log('Successfully received cart data:', response.cartData);
            
            // If we have cart data from the backend, we need to fetch the product details
            try {
              // Fetch all products to get their details
              const products = await fetchProducts();
              console.log('Fetched products:', products);
              
              // Convert backend cart data to frontend format
              const cartItems: CartItem[] = [];
              
              // Iterate through the cart data from the backend
              Object.entries(response.cartData).forEach(([productId, quantity]) => {
                console.log(`Processing cart item: productId=${productId}, quantity=${quantity}`);
                
                // Find the product in the products list
                // Try to match by either id or _id (MongoDB ObjectId)
                const product = products.find((p: Product) => {
                  // Convert both IDs to strings for comparison
                  const productIdStr = productId.toString();
                  const itemId = p.id.toString();
                  const itemMongoId = p._id?.toString();
                  
                  return itemId === productIdStr || (itemMongoId && itemMongoId === productIdStr);
                });
                
                if (product) {
                  console.log(`Found product for ID ${productId}:`, product);
                  cartItems.push({
                    product,
                    quantity: quantity as number
                  });
                } else {
                  console.log(`Product not found for ID ${productId}`);
                }
              });
              
              if (cartItems.length > 0) {
                console.log('Setting cart items from backend:', cartItems);
                setItems(cartItems);
              } else {
                console.log('No matching products found for cart items');
                // Fallback to localStorage if no products were found
                const savedCart = localStorage.getItem('cart');
                if (savedCart) {
                  const parsedCart = JSON.parse(savedCart);
                  console.log('Falling back to localStorage cart:', parsedCart);
                  setItems(parsedCart);
                }
              }
            } catch (error) {
              console.error('Error fetching product details:', error);
              // Fallback to localStorage
              const savedCart = localStorage.getItem('cart');
              if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                console.log('Error fallback to localStorage cart:', parsedCart);
                setItems(parsedCart);
              }
            }
          } else {
            console.log('No cart data returned from backend or request failed. Response:', response);
            // Fallback to localStorage
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
              const parsedCart = JSON.parse(savedCart);
              console.log('Fallback to localStorage (no backend data):', parsedCart);
              setItems(parsedCart);
            }
          }
        } else {
          // Not authenticated, use localStorage
          console.log('User not authenticated, using localStorage');
          const savedCart = localStorage.getItem('cart');
          if (savedCart) {
            const parsedCart = JSON.parse(savedCart);
            console.log('Loaded cart from localStorage (not authenticated):', parsedCart);
            setItems(parsedCart);
          }
        }
      } catch (error) {
        console.error('Error fetching cart data:', error);
        // Fallback to localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          console.log('Loaded cart from localStorage (error fallback):', parsedCart);
          setItems(parsedCart);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    console.log('CartContext useEffect triggered. isAuthenticated:', isAuthenticated, 'user:', user);
    fetchCartData();
  }, [isAuthenticated, user]);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = async (product: Product) => {
    try {
      setIsLoading(true);
      
      // Update local state first for immediate UI feedback
      setItems(currentItems => {
        const existingItem = currentItems.find(item => item.product.id === product.id);
        
        if (existingItem) {
          return currentItems.map(item => 
            item.product.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          );
        }
        
        return [...currentItems, { product, quantity: 1 }];
      });
      
      // If user is authenticated, update backend
      if (isAuthenticated && user) {
        // Use MongoDB ObjectId if available, otherwise use regular id
        // This addresses the MongoDB ObjectId issue mentioned in the memory
        const productId = product._id || product.id;
        console.log(`Adding product to cart with ID: ${productId}`);
        
        const response = await cartService.addToCart(productId);
        if (!response.success) {
          toast.error(response.message || 'Failed to add item to cart');
          // Revert local state if backend update fails
          setItems(currentItems => {
            const existingItem = currentItems.find(item => item.product.id === product.id);
            
            if (existingItem && existingItem.quantity > 1) {
              return currentItems.map(item => 
                item.product.id === product.id 
                  ? { ...item, quantity: item.quantity - 1 } 
                  : item
              );
            }
            
            return currentItems.filter(item => item.product.id !== product.id);
          });
        } else {
          toast.success('Item added to cart');
        }
      } else {
        toast.success('Item added to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: number | string) => {
    try {
      setIsLoading(true);
      console.log(`Removing product from cart with ID: ${productId}`);
      
      // Update local state first
      setItems(currentItems => {
        console.log('Current items before removal:', currentItems);
        return currentItems.filter(item => {
          // Check both regular id and MongoDB _id
          const itemId = item.product.id.toString();
          const itemMongoId = item.product._id?.toString();
          
          console.log(`Comparing item ID ${itemId} and MongoDB ID ${itemMongoId} with ${productId}`);
          return itemId !== productId.toString() && (!itemMongoId || itemMongoId !== productId.toString());
        });
      });
      
      // If user is authenticated, update backend
      if (isAuthenticated && user) {
        const response = await cartService.removeFromCart(productId);
        console.log('Remove from cart response:', response);
        if (!response.success) {
          toast.error(response.message || 'Failed to remove item from cart');
          // No need to revert state as the item was already removed
        }
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: number | string, quantity: number) => {
    try {
      setIsLoading(true);
      console.log(`Updating quantity for product ${productId} to ${quantity}`);
      
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }
      
      // Update local state first
      setItems(currentItems => {
        console.log('Current items before update:', currentItems);
        return currentItems.map(item => {
          // Check both regular id and MongoDB _id
          const itemId = item.product.id.toString();
          const itemMongoId = item.product._id?.toString();
          
          const isMatch = itemId === productId.toString() || 
                        (itemMongoId && itemMongoId === productId.toString());
          
          console.log(`Comparing item ID ${itemId} and MongoDB ID ${itemMongoId} with ${productId}, isMatch: ${isMatch}`);
          
          return isMatch ? { ...item, quantity } : item;
        });
      });
      
      // If user is authenticated, update backend
      if (isAuthenticated && user) {
        const response = await cartService.updateCartItem(productId, quantity);
        console.log('Update cart response:', response);
        
        if (!response.success) {
          toast.error(response.message || 'Failed to update cart');
          // Revert local state if backend update fails
          setItems(prevItems => {
            const prevItem = prevItems.find(item => {
              const itemId = item.product.id.toString();
              const itemMongoId = item.product._id?.toString();
              
              return itemId === productId.toString() || 
                    (itemMongoId && itemMongoId === productId.toString());
            });
            
            if (!prevItem) return prevItems;
            
            return prevItems.map(item => {
              const itemId = item.product.id.toString();
              const itemMongoId = item.product._id?.toString();
              
              const isMatch = itemId === productId.toString() || 
                            (itemMongoId && itemMongoId === productId.toString());
              
              return isMatch ? { ...item, quantity: prevItem.quantity } : item;
            });
          });
        }
      }
    } catch (error) {
      console.error('Error updating cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      
      // Update local state first
      setItems([]);
      
      // If user is authenticated, update backend
      if (isAuthenticated && user) {
        const response = await cartService.clearCart();
        if (!response.success) {
          toast.error(response.message || 'Failed to clear cart');
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart,
        totalItems,
        totalPrice,
        isLoading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};