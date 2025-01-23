import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET() {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    console.log("User not authenticated");
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Not Authenticated'
      }),
      {
        status: 401
      }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  console.log("Fetching messages for user ID:", userId);

  try {
    // First, check if user exists
    const userExists = await UserModel.findById(userId);
    
    if (!userExists) {
      console.log("User not found in the database");
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User not found'
        }),
        {
          status: 404
        }
      );
    }

    // If user has no messages, return empty array
    if (!userExists.messages || userExists.messages.length === 0) {
      console.log("No messages found for user");
      return new Response(
        JSON.stringify({
          success: true,
          message: []
        }),
        {
          status: 200
        }
      );
    }

    // If user has messages, proceed with aggregation 
    const userAggregation = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    console.log("Messages fetched successfully for user ID:", userId);
    return new Response(
      JSON.stringify({
        messages: userAggregation[0]?.messages || [],
        success: true 
      }),
      {
        status: 200
      }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(
      JSON.stringify({
        messages: 'Internal server error',
        success: false 
      }),
      {
        status: 500
      }
    );
  }
}