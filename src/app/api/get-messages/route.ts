import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import mongoose from 'mongoose';
import { User } from 'next-auth';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';

export async function GET(request: Request) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    console.log("User not authenticated");
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const userId = new mongoose.Types.ObjectId(user._id);
  console.log("Fetching messages for user ID:", userId);

  try {
    const userAggregation = await UserModel.aggregate([
      { $match: { _id: userId } },
      { $unwind: '$messages' },
      { $sort: { 'messages.createdAt': -1 } },
      { $group: { _id: '$_id', messages: { $push: '$messages' } } },
    ]).exec();

    console.log("User aggregation result:", userAggregation);

    if (!userAggregation || userAggregation.length === 0) {
      console.log("User not found in the database");
      return new Response(
        JSON.stringify({ message: 'User not found', success: false }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log("Messages fetched successfully for user ID:", userId);
    return new Response(
      JSON.stringify({ messages: userAggregation[0].messages }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    return new Response(
      JSON.stringify({ message: 'Internal server error', success: false }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}