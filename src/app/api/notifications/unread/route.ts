import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    const user = await UserModel.findById(session.user._id).lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const unreadMessages = user.messages?.filter(message => 
      !message.isRead && !message.reply
    ) || [];
    
    return NextResponse.json({
      success: true,
      newMessages: unreadMessages,
      unreadCount: unreadMessages.length
    });
    
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch unread notifications' },
      { status: 500 }
    );
  }
}