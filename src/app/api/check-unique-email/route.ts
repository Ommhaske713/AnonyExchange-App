import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';

export async function GET(request: Request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Email is required',
      }),
      { status: 400 }
    );
  }

  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'User already exists with this email',
      }),
      { status: 400 }
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Email is unique',
    }),
    { status: 200 }
  );
}