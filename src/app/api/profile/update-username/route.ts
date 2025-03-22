import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { newUsername } = await req.json();

    if (!newUsername || typeof newUsername !== 'string' || newUsername.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Invalid username' },
        { status: 400 }
      );
    }

    const existingUser = await UserModel.findOne({ username: newUsername });
    
    if (existingUser && (existingUser as any)._id.toString() !== session.user._id) {
      return NextResponse.json(
        { success: false, message: 'Username is already taken' },
        { status: 409 }
      );
    }

    await UserModel.findByIdAndUpdate(
      session.user._id, 
      { username: newUsername }
    );
    
    return NextResponse.json({
      success: true,
      message: 'Username updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating username:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update username' },
      { status: 500 }
    );
  }
}