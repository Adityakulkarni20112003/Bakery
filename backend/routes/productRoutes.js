import express from 'express';
import upload from '../middleware/multer.js'; 
import {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct
} from '../controllers/productController.js';
import adminAuth  from '../middleware/adminAuth.js';  

const productRouter = express.Router();

productRouter.post('/add', adminAuth, upload.single('image1'),addProduct);
productRouter.get('/list', listProducts);
productRouter.get('/single/:id', singleProduct);
productRouter.delete('/remove/:id', adminAuth, removeProduct);

export default productRouter;
