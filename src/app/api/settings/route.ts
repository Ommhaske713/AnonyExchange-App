import { getServerSession } from "next-auth/next";
import { authOptions } from '../auth/[...nextauth]/options';
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function GET(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const user = await UserModel.findOne({ email: session.user.email })
      .select("showQuestions isAcceptingMessages");
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: {
        showQuestions: user.showQuestions,
        isAcceptingMessages: user.isAcceptingMessages
      }
    });
    
  } catch (error) {
    console.error("Error fetching user settings:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to fetch user settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();

    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const updateData: Record<string, any> = {};
    
    if (typeof body.showQuestions === 'boolean') {
      updateData.showQuestions = body.showQuestions;
    }
    
    if (typeof body.isAcceptingMessages === 'boolean') {
      updateData.isAcceptingMessages = body.isAcceptingMessages;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid settings to update" },
        { status: 400 }
      );
    }

    const updatedUser = await UserModel.findOneAndUpdate(
      { email: session.user.email },
      { $set: updateData },
      { new: true }
    );
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        showQuestions: updatedUser.showQuestions,
        isAcceptingMessages: updatedUser.isAcceptingMessages
      }
    });
    
  } catch (error) {
    console.error("Error updating user settings:", error);
    
    return NextResponse.json(
      { success: false, message: "Failed to update user settings" },
      { status: 500 }
    );
  }
}