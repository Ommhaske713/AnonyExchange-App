import UserModel from "@/model/User";
import dbConnect from "@/lib/dbConnect";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"
import exp from "constants";
import Email from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: 'credentials',
            name: 'Credentials',
            credentials: {
                email: { label: 'Email or Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials: any): Promise<any> {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error('Please provide all required fields');
                }
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier.toLowerCase() },
                            { username: credentials.identifier },
                        ],
                    });
                    if (!user) {
                        throw new Error('Invalid credentials');
                    }
                    if (!user.isVerified) {
                        throw new Error('Please verify your account before logging in');
                    }
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    if (!isPasswordCorrect) {
                        throw new Error('Invalid credentials');
                    } 
                    return {
                        _id: user._id,
                        email: user.email,
                        username: user.username,
                        isVerified: user.isVerified,
                        isAcceptingMessages: user.isAcceptingMessages,
                    };
                } catch (err: any) {
                    throw new Error(err);
                }
            },

        }),
    ],
    callbacks :{
        async jwt({ token, user}) {
            if (user) {
                token._id = user._id?.toString();
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username;
                token.isVerified = user.isVerified;
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.isVerified = token.isVerified;
                session.user.username = token.username;
            }
            return session
          }
    },
    pages:{
        signIn:'/sign-in',
        error: '/auth/error'
    },
    session : {
        strategy:'jwt'
    },
    secret:process.env.AUTH_SECRET
}
