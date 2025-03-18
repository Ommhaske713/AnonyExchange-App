'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import * as z from 'zod';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/schema/verifySchema';
import type { ApiResponse } from '@/types/ApiResponse';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: ''
    }
  });

  useEffect(() => {
    if (countdown > 0 && !canResend) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  const handleResendCode = async () => {
    if (isResending || !canResend) return;

    setIsResending(true);
    try {
      const response = await axios.post<ApiResponse>('/api/resend-verify-code', {
        username: params.username
      });

      toast({
        title: 'Code Resent',
        description: response.data.message,
        className: 'bg-green-500 text-white',
      });

      setCountdown(60);
      setCanResend(false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Failed to Resend Code',
        description: axiosError.response?.data.message ?? 'Failed to resend verification code',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsResending(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/verify-code', {
        username: params.username,
        code: data.code,
      });

      console.log('Verification response:', response.data);

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message ?? 'Account verified successfully',
          className: 'bg-green-500 text-white',
        });

        setTimeout(() => {
          router.replace('/dashboard');
        }, 1500);
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage = axiosError.response?.data.message 
        || (axiosError instanceof Error ? axiosError.message : 'Verification failed');

      toast({
        title: 'Verification Failed',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#1a1f2e] to-black relative overflow-hidden">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-purple-500/20 rounded-full blur-3xl" />

      <div className="absolute top-8 left-8 z-20">
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          onClick={() => router.push('/sign-in')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Verify Your Account
          </CardTitle>
          <p className="text-gray-400">
            Enter the verification code sent to your email
          </p>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Verification Code</FormLabel>
                    <Input
                      {...field}
                      className="bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12"
                      placeholder="Enter 6-digit code"
                      maxLength={6}
                      minLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={field.value}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        field.onChange(value);
                      }}
                      disabled={isSubmitting}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:shadow-[0_0_20px_rgba(66,153,225,0.6)]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </div>
                ) : (
                  'Verify Account'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-gray-400 hover:text-white hover:bg-white/10"
                onClick={handleResendCode}
                disabled={isResending || !canResend}
              >
                {!canResend ? (
                  `Resend code in ${countdown}s`
                ) : isResending ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  'Resend Code'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </main>
  );
}