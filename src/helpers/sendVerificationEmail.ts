import { transporter } from '@/lib/nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const mailOptions = {
            from: `"Feedback App " <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verification Code',
            text: `Hello ${username},\n\nYour verification code is ${verifyCode}\n\nThank you!`
        };

        await transporter.sendMail(mailOptions);
        
        return { success: true, message: "Verification email sent successfully" };
    } catch (emailError) {
        console.log("Error while sending the email: ", emailError);
        return { success: false, message: "Failed to send verification email" };
    }
}