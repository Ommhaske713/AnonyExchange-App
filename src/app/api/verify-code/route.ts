import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const { username, code } = await request.json();

        const decodedUsername = decodeURIComponent(username);

        // 🔍 Find the user by username
        const user = await UserModel.findOne({ username: decodedUsername });

        if (!user) {
            return Response.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        // ✅ Check if the entered code matches the stored verifyCode
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = user.verifyCodeExpiry ? new Date(user.verifyCodeExpiry) > new Date() : false;

        if (isCodeValid && isCodeNotExpired) {
            // ✅ Mark the user as verified
            user.isVerified = true;
            user.verifyCode = undefined; // Clear the verification code
            user.verifyCodeExpiry = undefined; // Clear the verification code expiry
            await user.save();

            return Response.json(
                { success: true, message: "Account verified successfully" },
                { status: 200 }
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