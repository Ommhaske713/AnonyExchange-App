'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/schema/signUpSchema";

const SignUpPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounce(username, 500);
  const debouncedEmail = useDebounce(email, 500);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    },
  });

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true);
        setUsernameMessage('');

        try {
          const response = await axios.get(`/api/check-unique-username?username=${debouncedUsername}`);
          setUsernameMessage('Username is available');
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(axiosError.response?.data.message ?? "Username is already taken. Please try a different one.");
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };

    checkUsernameUnique();
  }, [debouncedUsername]);

  useEffect(() => {
    const checkEmailUnique = async () => {
      if (debouncedEmail) {
        setIsCheckingEmail(true);
        setEmailMessage('');

        try {
          const response = await axios.get(`/api/check-unique-email?email=${debouncedEmail}`);
          setEmailMessage('email is unique');
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setEmailMessage(axiosError.response?.data.message ?? "User already exists with this email.");
        } finally {
          setIsCheckingEmail(false);
        }
      }
    };

    checkEmailUnique();
  }, [debouncedEmail]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);

    try {
      const response = await axios.post<ApiResponse>(`/api/sign-up`, data);
      toast({
        title: response.data.success ? 'Success' : 'Error',
        description: response.data.message || (response.data.success ? 'Sign up successful' : 'Sign up failed'),
      });
      
      router.push(`/verify/${username}`);

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
      toast({
        title: 'Sign-up failed',
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 via-[#8793ac] to-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transition-shadow hover:shadow-xl ">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 lg:text-5xl mb-6">
            Join True Feedback
          </h1>
          <p className="text-gray-600 mb-4">Sign up to start your anonymous adventure</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        {...field}
                        className="pl-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                        onChange={(e) => {
                          field.onChange(e);
                          setUsername(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  {isCheckingUsername && <Loader2 className="animate-spin text-indigo-500" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is available' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        {...field}
                        type="email"
                        className="pl-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                        onChange={(e) => {
                          field.onChange(e);
                          setEmail(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  {isCheckingEmail && <Loader2 className="animate-spin text-indigo-500" />}
                  {!isCheckingEmail && emailMessage && (
                    <p
                      className={`text-sm ${
                        emailMessage === 'email is unique' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {emailMessage}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input {...field} type="password" className="pl-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-black to-[#8793ac] text-white font-semibold py-2 rounded-md shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-700">
            Already a member?{' '}
            <Link href="/sign-in" className="text-[#8793ac] hover:text-indigo-600 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;