import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';

async function createSession(user: any) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    username: user.username,
    image: user.image || null
  };
}

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = user.verifyCodeExpiry ? new Date(user.verifyCodeExpiry) > new Date() : false;

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            user.verifyCode = undefined; 
            user.verifyCodeExpiry = undefined;
            await user.save();

            const session = await createSession(user);

            return Response.json(
                { 
                    success: true, 
                    message: "Account verified successfully",
                    session: session  
                },
                { 
                    status: 200,
                    headers: {
                    }
                }
            );
        } else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verification code is expired. Please sign up again to get a new code.",
                },
                { status: 400 }
            );
        } else {
            return Response.json(
                { success: false, message: "Incorrect verification code" },
                { status: 400 }
            );
        }
    } catch (error) {
        console.error("Error while verifying code:", error);
        return Response.json(
            { success: false, message: "Error while verifying code" },
            { status: 500 }
        );
    }
}