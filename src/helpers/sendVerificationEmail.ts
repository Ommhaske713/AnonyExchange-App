import { transporter } from '@/lib/nodemailer';
import { ApiResponse } from "@/types/ApiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
): Promise<ApiResponse> {
    try {
        const formattedCode = verifyCode.split('').join(' ');

        const mailOptions = {
            from: `"AnonyExchange" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Verify Your Account',
            text: `Hello ${username},

Your verification code is: ${verifyCode}

This code will expire in 10 minutes.

For security:
- Never share this code with anyone
- Our team will never ask for your code
- Enter the code on our website only

If you didn't request this code, please ignore this email or contact support if you're concerned.

Thank you!
AnonyExchange Team`,
            html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Account</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            border: 1px solid #eaeaea;
        }
        .email-header {
            background: linear-gradient(to right, #4F46E5, #7C3AED);
            color: #ffffff;
            padding: 30px 30px;
            text-align: center;
        }
        .email-header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .email-body {
            padding: 30px;
            background-color: #ffffff;
        }
        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .message {
            margin-bottom: 30px;
            color: #555;
        }
        .verification-box {
            background-color: #f5f7fb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 25px 0;
            border: 1px solid #e0e5ee;
        }
        .verification-code {
            letter-spacing: 4px;
            font-size: 32px;
            font-weight: bold;
            color: #4F46E5;
            margin: 10px 0;
            font-family: monospace;
        }
        .expiry-note {
            font-size: 14px;
            color: #777;
            margin-top: 8px;
        }
        .security-notice {
            background-color: #fdf9e8;
            border-left: 4px solid #f7b84b;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
        }
        .security-notice h4 {
            margin-top: 0;
            color: #876024;
        }
        .security-notice ul {
            padding-left: 20px;
            margin-bottom: 0;
            color: #6b5117;
        }
        .email-footer {
            padding: 20px 30px;
            background-color: #f9f9f9;
            color: #666;
            font-size: 14px;
            text-align: center;
            border-top: 1px solid #eaeaea;
        }
        .footer-links {
            margin-top: 10px;
        }
        .footer-links a {
            color: #4F46E5;
            text-decoration: none;
            margin: 0 10px;
        }
        .logo {
            margin-bottom: 15px;
        }
        @media only screen and (max-width: 600px) {
            .email-body, .email-header, .email-footer {
                padding: 20px 15px;
            }
            .verification-code {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="logo">
                <!-- Logo placeholder -->
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="60" height="60" rx="12" fill="white" fill-opacity="0.1"/>
                    <path d="M45 20C45 15.0294 40.9706 11 36 11H24C19.0294 11 15 15.0294 15 20V32C15 36.9706 19.0294 41 24 41H36C40.9706 41 45 36.9706 45 32V20Z" fill="white" fill-opacity="0.8"/>
                    <path d="M20 45C22.7614 45 25 42.7614 25 40C25 37.2386 22.7614 35 20 35C17.2386 35 15 37.2386 15 40C15 42.7614 17.2386 45 20 45Z" fill="white" fill-opacity="0.8"/>
                    <path d="M40 45C42.7614 45 45 42.7614 45 40C45 37.2386 42.7614 35 40 35C37.2386 35 35 37.2386 35 40C35 42.7614 37.2386 45 40 45Z" fill="white" fill-opacity="0.8"/>
                    <path d="M30 50C32.7614 50 35 47.7614 35 45C35 42.2386 32.7614 40 30 40C27.2386 40 25 42.2386 25 45C25 47.7614 27.2386 50 30 50Z" fill="white" fill-opacity="0.8"/>
                </svg>
            </div>
            <h1>Verify Your Account</h1>
        </div>
        <div class="email-body">
            <div class="greeting">Hello ${username},</div>
            <div class="message">
                Thank you for signing up! To complete your registration and access all features, please verify your account using the code below.
            </div>
            
            <div class="verification-box">
                <div>Your verification code is:</div>
                <div class="verification-code">${formattedCode}</div>
                <div class="expiry-note">This code will expire in 10 minutes</div>
            </div>
            
            <div class="security-notice">
                <h4>For your security:</h4>
                <ul>
                    <li>Never share this code with anyone</li>
                    <li>Only enter this code on our official website</li>
                </ul>
            </div>
            
            <div class="message">
                If you did not request this verification, please ignore this email or contact our support team if you're concerned.
            </div>
        </div>
        <div class="email-footer">
            <div>&copy; ${new Date().getFullYear()} AnonyExchange. All rights reserved.</div>
            <div class="footer-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Support</a>
            </div>
        </div>
    </div>
</body>
</html>
            `
        };

        await transporter.sendMail(mailOptions);

        return { success: true, message: "Verification email sent successfully" };
    } catch (emailError) {
        console.error("Error while sending the email: ", emailError);
        return { success: false, message: "Failed to send verification email" };
    }
}