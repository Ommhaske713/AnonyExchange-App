import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        console.log("User not authenticated");
        return new Response(JSON.stringify({
            success: false,
            message: "User not authenticated"
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const userId = user._id;
    const { acceptMessages } = await request.json();

    try {
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessages },
            { new: true }
        );

        if (!updatedUser) {
            console.log("User not found");
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            message: "Message acceptance status updated successfully"
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.log("Failed to update message acceptance status:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Failed to update message acceptance status"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function GET(request: Request) {
    await dbConnect();

    const session = await getServerSession(authOptions);
    const user: User = session?.user;

    if (!session || !session.user) {
        console.log("User not authenticated");
        return new Response(JSON.stringify({
            success: false,
            message: "User not authenticated"
        }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId);

        if (!foundUser) {
            console.log("User not found");
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        return new Response(JSON.stringify({
            success: true,
            isAcceptingMessage: foundUser.isAcceptingMessages
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.log("Error in getting message acceptance status:", error);
        return new Response(JSON.stringify({
            success: false,
            message: "Error in getting message acceptance status"
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}