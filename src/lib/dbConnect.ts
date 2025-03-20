import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongooseCache {
  conn: mongoose.Mongoose | null;
  promise: Promise<mongoose.Mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

async function dbConnect() {
  if (cached.conn) {
    console.log('Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      serverSelectionTimeoutMS: 10000, 
      socketTimeoutMS: 45000,
    };

    console.log('Connecting to MongoDB...');
    console.log(`URI prefix: ${MONGODB_URI.split('@')[0].split('://')[0]}://*****@${MONGODB_URI.split('@')[1]?.substring(0, 15)}...`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB!');
      return mongoose;
    }).catch(err => {
      console.error('MongoDB connection error:');
      console.error(`Error name: ${err.name}`);
      console.error(`Error message: ${err.message}`);
      if (err.cause) {
        console.error(`Cause: ${err.cause.message || err.cause}`);
      }
      throw err;
    });
  }
  
  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;