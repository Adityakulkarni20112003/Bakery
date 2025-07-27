import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import productRouter from './routes/productRoutes.js';      
import userRouter from './routes/userRoutes.js';
import cartRouter from './routes/cartRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import recipeRouter from './routes/recipeRoutes.js';



//App onfig
const app = express();
const port = process.env.PORT || 4000;

//Connect to MongoDB
connectDB();

//Connect to Cloudinary
connectCloudinary();

//Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174'], // Vite dev server and preview server
  credentials: true
}));
app.use(express.json());

//Routes
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/recipes', recipeRouter);


app.get('/', (req, res) => {
    res.send('API is running');
});

//Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
