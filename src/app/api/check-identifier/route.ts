import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const identifier = searchParams.get('identifier');

    if (!identifier) {
      return NextResponse.json(
        {
          success: false,
          message: 'Identifier is required',
        },
        { status: 400 }
      );
    }
    
    const user = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'No user exists with this identifier',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Identifier exists',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking identifier:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking identifier',
      },
      { status: 500 }
    );
  }
}