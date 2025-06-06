import api from './api';

// Interface for order data
export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
  productName?: string; // Optional because older orders might not have it
}

export interface Order {
  _id: string;
  userId: string;
  items: OrderItem[];
  amount: number;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: string;
  paymentMethod: string;
  payment: boolean;
  date: number;
}

// Interface for order API responses
interface OrderResponse {
  success: boolean;
  orders?: Order[];
  message?: string;
}

/**
 * Get orders for the current user
 */
export const getUserOrders = async (): Promise<OrderResponse> => {
  try {
    // Use GET request since we're not sending any data in the body
    // The user ID will be extracted from the JWT token on the backend
    const response = await api.get('/orders/user-orders');
    console.log('Orders response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user orders:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch orders'
    };
  }
};

/**
 * Format date from timestamp to readable format
 */
export const formatOrderDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get status badge color based on order status
 */
export const getStatusBadgeColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'shipped':
      return 'bg-blue-100 text-blue-800';
    case 'processing':
      return 'bg-yellow-100 text-yellow-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'order placed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (): Promise<OrderResponse> => {
  try {
    const response = await api.get('/orders/all');
    console.log('All orders response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching all orders:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch all orders'
    };
  }
};

/**
 * Download invoice for an order
 * @param orderId - The ID of the order to generate an invoice for
 */
export const downloadInvoice = async (orderId: string): Promise<void> => {
  try {
    // Use axios to get the invoice with responseType blob
    const response = await api.get(`/orders/invoice/${orderId}`, {
      responseType: 'blob'
    });
    
    // Create a blob URL for the invoice
    const blob = new Blob([response.data], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${orderId}.html`);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error('Error downloading invoice:', error);
    throw new Error(error.response?.data?.message || 'Failed to download invoice');
  }
};

/**
 * Update order status (admin only)
 */
export const updateOrderStatus = async (orderId: string, newStatus: string): Promise<OrderResponse> => {
  try {
    const response = await api.put('/orders/update-status', { orderId, status: newStatus });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order status:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update order status'
    };
  }
};

/**
 * Send invoice email to customer
 */
export const sendInvoiceEmail = async (orderId: string): Promise<OrderResponse> => {
  try {
    // Send request to send invoice email
    const response = await api.post(`/orders/send-invoice/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send invoice email'
    };
  }
};
