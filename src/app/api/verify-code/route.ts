import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request:Request) {
    await dbConnect()

    try {
        const {username,code} = await request.json()

        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({username:decodedUsername})

        if (!user) {
            return Response.json({
                success:false,
                messaage:" user not found "
    
            },
            {status:500}
           )
        }

        const isCodeValid = user.isVerified === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()

            return Response.json({
                success:true,
                messaage:"Account verified successfully"
    
            },
            {status:200}
           )
        }
        else if(!isCodeNotExpired){
            return Response.json({
                success:false,
                messaage:"Verification code is expired pleases signup again to get a new code"
                
            },
            {status:400}
           )
        }
        else{
            return Response.json({
                success:false,
                messaage:"Incorrect verification code"
    
            },
            {status:400}
           )
        }

    } catch (error) {
        console.error("Error while verifying code :",error)
        return Response.json({
            success:false,
            messaage:"Error while verifying code "

        },
        {status:500}
       )
    }
}