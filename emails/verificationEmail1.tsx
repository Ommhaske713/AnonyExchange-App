import React, { useState } from 'react';

interface VerificationEmailProps {
    email: string;
    onResend: () => void;
    otp: string;
}

const VerificationEmail: React.FC<VerificationEmailProps> = ({ email, onResend, otp }) => {
    const [resendDisabled, setResendDisabled] = useState(false);

    const handleResend = () => {
        setResendDisabled(true);
        onResend();
        setTimeout(() => setResendDisabled(false), 60000); // Resend button re-enabled after 60 seconds
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6' }}>
            <h2>Email Verification</h2>
            <p>Dear User,</p>
            <p>Thank you for registering with us. Please use the following OTP to verify your email address:</p>
            <h3 style={{ color: '#2E86C1' }}>{otp}</h3>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you did not request this verification, please ignore this email.</p>
            <button onClick={handleResend} disabled={resendDisabled}>
                {resendDisabled ? 'Resend OTP (Wait 60s)' : 'Resend OTP'}
            </button>
        </div>
    );
};

export default VerificationEmail;