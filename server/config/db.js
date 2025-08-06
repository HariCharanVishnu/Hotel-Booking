import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotel-booking';
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('💡 Make sure MongoDB is running on your system');
    console.log('💡 You can start MongoDB with: mongod');
    
    // Don't exit the process, let it continue with a warning
    console.log('⚠️ Server will continue without database connection');
  }
}; 