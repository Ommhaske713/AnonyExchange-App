import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

export async function POST(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not verified"
        },
            {
                status: 401
            }
        )
    }

    const userId = user._id;

    const { acceptMessage } = await request.json();

    try {

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessages: acceptMessage },
            { new: true }
        )

        if (!updatedUser) {
            return Response.json({
                success: false,
                message: "failed to update the status to accept the messages"
            },
                {
                    status: 401
                }
            )
        }

        return Response.json({
            success: true,
            message: "message acceptance status updated successfully"
        },
            {
                status: 201
            }
        )

    } catch (error) {
        console.log("failed to update the status to accept the messages")
        return Response.json({
            success: false,
            message: "failed to update the status to accept the messages"
        },
            {
                status: 500
            }
        )
    }
}

export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)

    const user: User = session?.user

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "not verified"
        },
            {
                status: 401
            }
        )
    }

    const userId = user._id;

    try {
        const foundUser = await UserModel.findById(userId)
    
        if (!foundUser) {
            return Response.json({
                success: false,
                message: "user not found"
            },
                {
                    status: 404
                }
            )
        }
        return Response.json({
            success: true,
            message: "message acceptance status changed",
            isAcceptingMessage: foundUser?.isAcceptingMessages
            
        },
            {
                status: 201
            }
        )
    } catch (error) {

        console.log("Error in getting message acceptance status : ",error)
        return Response.json({
            success: false,
            message: "Error in getting message acceptance status"
        },
            {
                status: 500
            }
        )
     }
}