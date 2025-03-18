import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const url = new URL(request.url);
    const usernameParam = url.searchParams.get('username');

    const session = await getServerSession(authOptions);

    let user;
    let isOwnProfile = false;
    
    if (usernameParam) {
      user = await UserModel.findOne({ username: usernameParam }).select("messages username showQuestions");
      
      if (!user) {
        return NextResponse.json(
          { success: false, message: "User not found" },
          { status: 404 }
        );
      }

      if (session?.user?.email) {
        const currentUser = await UserModel.findOne({ email: session.user.email }).select("username");
        isOwnProfile = currentUser?.username === user.username;
      }
    } else if (session?.user?.email) {
      user = await UserModel.findOne({ email: session.user.email }).select("messages username showQuestions");
      isOwnProfile = true;
    } else {
      return NextResponse.json(
        { success: false, message: "Please provide a username or login" },
        { status: 400 }
      );
    }

    if (!isOwnProfile && user && user.showQuestions === false) {
      return NextResponse.json(
        { success: false, message: "This user has disabled question viewing visibility" },
        { status: 403 }
      );
    }

    const messages = user?.messages || [];
    const username = user?.username || (session?.user as any)?.username;

    return NextResponse.json({
      success: true,
      messages: messages.map(msg => ({
        _id: msg._id,
        content: msg.content,
        createdAt: msg.createdAt,
        reply: msg.reply,
        repliedAt: msg.repliedAt,
        username: username
      }))
    });
    
  } catch (error) {
    console.error("Error fetching user messages:", error);
    
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error instanceof Error ? error.message : 'Unknown error'
      : 'Failed to fetch messages';

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}