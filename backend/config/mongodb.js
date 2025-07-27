import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Set up connection event listeners
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected!')
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected!');
        });

        // Connect to MongoDB with improved options
        await mongoose.connect(`${process.env.MONGODB_URI}/bakery`, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });

        console.log('MongoDB connection established successfully');
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        // Don't exit the process, but log the error
    }
};

export default connectDB;