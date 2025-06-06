// controllers/productController.js
import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js';


// Add Product this for admin panel
const addProduct = async (req, res) => {
  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product image is required' 
      });
    }

    // Clean and extract form data
    const cleanBody = {};
    Object.keys(req.body).forEach(key => {
      cleanBody[key.trim()] = typeof req.body[key] === 'string' ? req.body[key].trim() : req.body[key];
    });
    
    const { name, description, price, category, popular = 'false' } = cleanBody;
    
    // Validate required fields
    const validationErrors = [];
    if (!name) validationErrors.push('Name is required');
    if (!description) validationErrors.push('Description is required');
    if (!price) validationErrors.push('Price is required');
    if (!category) validationErrors.push('Category is required');

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Validate and parse price
    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Price must be a valid positive number' 
      });
    }

    // Upload image to Cloudinary
    let imageUrl;
    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'products',
        resource_type: 'image',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      });
      imageUrl = result.secure_url;
    } catch (uploadError) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to upload image' 
      });
    }

    // Prepare product data
    const productData = {
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      image: imageUrl,
      category: category.trim().toLowerCase(),
      popular: popular === 'true' || popular === true
    };

    // Create product in database
    const product = await productModel.create(productData);

    // Return success response (exclude sensitive data if any)
    const responseData = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.category,
      popular: product.popular,
      createdAt: product.createdAt
    };

    res.status(201).json({ 
      success: true, 
      message: 'Product added successfully', 
      product: responseData 
    });

  } catch (error) {
    // Handle different types of errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      }));
      
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validationErrors
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        success: false, 
        message: 'Database operation failed' 
      });
    }

    // Log error for debugging (only in development)
    if (process.env.NODE_ENV !== 'production') {
      console.error('addProduct error:', error);
    }

    // Generic error response
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// List Products
const listProducts = async (_req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    console.error('listProducts ➜', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Remove Product this for admin panel
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (err) {
    console.error('removeProduct ➜', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Single Product
const singleProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (err) {
    console.error('singleProduct ➜', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
    addProduct,
    listProducts,
    removeProduct,
    singleProduct
}

