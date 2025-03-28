import UserModel from "@/model/User";
import { z } from "zod"
import { usernameValidation } from "@/schema/signUpSchema"
import dbConnect from "@/lib/dbConnect";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    await dbConnect()

    try {
        const { searchParams } = new URL(request.url)
        const querySchema = {
            username: searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(querySchema)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: "Invalid username format",
                errors: usernameErrors
            },
            { status: 400 }
            )
        }

        const { username } = result.data

        const existingUser = await UserModel.findOne({ username }) 

        if (existingUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            },
            { status: 409 } 
            )
        }

        return Response.json({
            success: true,
            message: "Username is available"
        },
        { status: 200 }
        )
        
    } catch (error) {
        console.error("Error while checking unique username:", error)
        return Response.json({
            success: false,
            message: "Error checking unique username",
            error: process.env.NODE_ENV === 'development' ? String(error) : undefined
        },
        { status: 500 }
        )
    }
}