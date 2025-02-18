import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';
import { generateVerificationCode } from '@/lib/utils';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { username } = await request.json();

        const user = await UserModel.findOne({ username });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'User not found' },
                { status: 404 }
            );
        }

        const oneMinuteAgo = new Date(Date.now() - 60000);
        const lastCodeSentTime = user.verifyCodeExpiry
            ? new Date(user.verifyCodeExpiry.getTime() - 3600000) 
            : null;

        if (lastCodeSentTime && lastCodeSentTime > oneMinuteAgo) {
            const timeLeft = Math.ceil((lastCodeSentTime.getTime() - oneMinuteAgo.getTime()) / 1000);
            return NextResponse.json(
                {
                    success: false,
                    message: `Please wait ${timeLeft} seconds before requesting a new code`
                },
                { status: 429 }
            );
        }

        const verifyCode = generateVerificationCode();
        const expiryDate = new Date(Date.now() + 3600000); 

        user.verifyCode = verifyCode;
        user.verifyCodeExpiry = expiryDate;
        await user.save();


        const emailResponse = await sendVerificationEmail(
            user.email,
            username,
            verifyCode
        );

        if (!emailResponse.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to send verification email'
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'New verification code sent successfully'
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error in resend-verify-code:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Internal server error'
            },
            { status: 500 }
        );
    }
}