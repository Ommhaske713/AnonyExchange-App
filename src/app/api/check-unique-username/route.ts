import UserModel from "@/model/User";
import {z} from "zod"
import {usernameValidation} from "@/schema/signUpSchema"
import dbConnect from "@/lib/dbConnect";

const usernameQuerySchema = z.object({
    username:usernameValidation
})

export async function GET(request:Request) {
    
    await dbConnect()

    try {

        const {searchParams} = new URL(request.url)
        const querySchema = {
            username:searchParams.get('username')
        }

        const result = usernameQuerySchema.safeParse(querySchema)

        console.log(result)

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success:false,
                messaage:"Invalid query parameter"
    
            },
            {status:400}
           )
        }

       const {username} = result.data

       const existingVerifiedUser = await UserModel.findOne({username,isVerified:true})

       if (existingVerifiedUser) {
        return Response.json({
            success:false,
            messaage:"username is already taken"

        },
        {status:400}
       )
       }

       return Response.json({
        success:true,
        messaage:"username is unique"

        },
        {status:200}
    )
        
    } catch (error) {
        console.error("Error while checking unique username :",error)
        return Response.json({
            success:false,
            messaage:"Error checking unique username"

        },
        {status:500}
       )
   }
} 