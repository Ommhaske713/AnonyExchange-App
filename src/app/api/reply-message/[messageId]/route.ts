import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { messageId: string } }
) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { reply } = await request.json();

    // Validate reply content
    if (!reply || typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json(
        { message: "Reply content is required" },
        { status: 400 }
      );
    }

    const user = await UserModel.findOneAndUpdate(
      { 
        email: session.user.email,
        "messages._id": params.messageId 
      },
      {
        $set: {
          "messages.$.reply": reply.trim(),
          "messages.$.repliedAt": new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { message: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Reply sent successfully",
      success: true,
      data: {
        reply: reply.trim(),
        repliedAt: new Date()
      }
    });

  } catch (error) {
    console.error("Error replying to message:", error);
    return NextResponse.json(
      { 
        message: "Something went wrong",
        error: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { status: 500 }
    );
  }
}