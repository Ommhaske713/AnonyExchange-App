import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { ObjectId } from 'mongodb';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user._id;
    const user = await UserModel.findById(userId).lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const messageActivities = (user.messages || []).map(message => ({
      _id: message._id,
      type: 'message',
      content: message.content,
      createdAt: message.createdAt,
      replied: !!message.reply,
      reply: message.reply,
      repliedAt: message.repliedAt
    }));

    const accountCreationActivity = {
      _id: user._id,
      type: 'account_created',
      action: 'Account created',
      createdAt: new ObjectId(user._id as ObjectId).getTimestamp(),  
      details: 'Account registered'
    };

    interface NotificationStatusChange {
      enabled: boolean;
      timestamp: Date | string;
    }

    interface NotificationStatusActivity {
      _id: string;
      type: 'notification_status';
      action: string;
      createdAt: Date | string;
      details: string;
    }

    const notificationStatusActivities: NotificationStatusActivity[] = ((user as any).notificationStatusChanges as NotificationStatusChange[] || []).map(change => ({
      _id: new ObjectId().toString(), 
      type: 'notification_status' as const,
      action: change.enabled ? 'Notifications enabled' : 'Notifications disabled',
      createdAt: change.timestamp,
      details: change.enabled 
      ? 'You will now receive notifications for new messages and replies' 
      : 'Notifications are now turned off'
    }));

    const allActivities = [
      ...messageActivities, 
      ...notificationStatusActivities, 
      accountCreationActivity
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return NextResponse.json({
      success: true,
      activities: allActivities
    });
    
  } catch (error) {
    console.error('Error fetching user activities:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch activities', error: String(error) },
      { status: 500 }
    );
  }
}