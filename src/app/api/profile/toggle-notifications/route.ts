import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { enabled } = await req.json();
    
    if (enabled === undefined) {
      return NextResponse.json(
        { success: false, message: 'Missing required field: enabled' },
        { status: 400 }
      );
    }
    
    await dbConnect();

    const result = await UserModel.findByIdAndUpdate(
      session.user._id,
      { 
        notificationsEnabled: enabled,
        $push: { 
          notificationStatusChanges: {
            enabled: enabled,
            timestamp: new Date()
          } 
        }
      },
      { new: true }
    );
    
    if (!result) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      enabled: (result as any).notificationsEnabled as boolean,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'} successfully`
    });
    
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update notification settings' },
      { status: 500 }
    );
  }
}