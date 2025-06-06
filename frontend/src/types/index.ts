export interface Product {
  id: string | number; // Can be string (MongoDB _id) or number
  _id?: string; // MongoDB ID, optional in frontend
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  popular: boolean;
}

export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string | number;
  _id?: string;  // MongoDB ObjectId, added based on memory about ObjectId issues
  name: string;
  email: string;
  avatar: string;
}