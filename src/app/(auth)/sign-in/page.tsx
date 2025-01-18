'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signInSchema } from '@/schema/signInSchema';
import { Loader2, Lock, Mail, User } from "lucide-react";
import axios, { AxiosError } from 'axios';
import { ApiResponse } from '@/types/ApiResponse';

export default function SignInForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [identifierMessage, setIdentifierMessage] = useState('');
  const [isCheckingIdentifier, setIsCheckingIdentifier] = useState(false);
  const debouncedIdentifier = useDebounce(identifier, 500);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  useEffect(() => {
    const checkIdentifierExists = async () => {
      if (debouncedIdentifier) {
        setIsCheckingIdentifier(true);
        setIdentifierMessage('');

        try {
          const response = await axios.get(`/api/check-identifier?identifier=${debouncedIdentifier}`);
          setIdentifierMessage('User exist with this username/email.');
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setIdentifierMessage(axiosError.response?.data.message ?? "No user exists with this username/email.");
        } finally {
          setIsCheckingIdentifier(false);
        }
      }
    };

    checkIdentifierExists();
  }, [debouncedIdentifier]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect username or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    }

    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-800 via-[#8793ac] to-black">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-lg transition-shadow hover:shadow-xl ">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <Input
                        {...field}
                        className="pl-10 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                        onChange={(e) => {
                          field.onChange(e);
                          setIdentifier(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  {isCheckingIdentifier && <Loader2 className="animate-spin text-indigo-500" />}
                  {!isCheckingIdentifier && identifierMessage && (
                    <p
                      className={`text-sm ${
                        identifierMessage === 'User exist with this username/email.' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {identifierMessage}
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
            >
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-700">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-[#8793ac] hover:text-indigo-600 font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}