'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useDebounce } from "@uidotdev/usehooks";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signUpSchema } from "@/schema/signUpSchema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [showPassword, setShowPassword] = useState(false);

  const usernameAbortControllerRef = useRef<AbortController | null>(null);
  const emailAbortControllerRef = useRef<AbortController | null>(null);

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: ''
    },
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        if (usernameAbortControllerRef.current) {
          usernameAbortControllerRef.current.abort();
        }

        usernameAbortControllerRef.current = new AbortController();
        const signal = usernameAbortControllerRef.current.signal;

        setIsCheckingUsername(true);
        setUsernameMessage('');

        try {
          await axios.get(`/api/check-unique-username?username=${encodeURIComponent(debouncedUsername.trim())}`, {
            signal,
            timeout: 5000
          });

          if (!signal.aborted) {
            setUsernameMessage('Username is available');
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            return;
          }

          if (!signal.aborted) {
            const axiosError = error as AxiosError<ApiResponse>;

            if (axiosError.code === 'ECONNABORTED') {
              setUsernameMessage('Request timed out. Please try again.');
            } else {
              setUsernameMessage(
                axiosError.response?.data.message ??
                "Username is already taken. Please try a different one."
              );
            }
          }
        } finally {
          if (!signal.aborted) {
            setIsCheckingUsername(false);
          }
        }
      }
    };

    checkUsernameUnique();

    return () => {
      if (usernameAbortControllerRef.current) {
        usernameAbortControllerRef.current.abort();
      }
    };
  }, [debouncedUsername]);

  useEffect(() => {
    const checkEmailUnique = async () => {
      if (debouncedEmail) {
        if (emailAbortControllerRef.current) {
          emailAbortControllerRef.current.abort();
        }

        emailAbortControllerRef.current = new AbortController();
        const signal = emailAbortControllerRef.current.signal;

        setIsCheckingEmail(true);
        setEmailMessage('');

        try {
          await axios.get(`/api/check-unique-email?email=${encodeURIComponent(debouncedEmail.trim())}`, {
            signal,
            timeout: 5000
          });

          if (!signal.aborted) {
            setEmailMessage('');
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            return;
          }

          if (!signal.aborted) {
            const axiosError = error as AxiosError<ApiResponse>;

            if (axiosError.code === 'ECONNABORTED') {
              setEmailMessage('Request timed out. Please try again.');
            } else {
              setEmailMessage(
                axiosError.response?.data.message ??
                "User already exists with this email."
              );
            }
          }
        } finally {
          if (!signal.aborted) {
            setIsCheckingEmail(false);
          }
        }
      }
    };

    checkEmailUnique();

    return () => {
      if (emailAbortControllerRef.current) {
        emailAbortControllerRef.current.abort();
      }
    };
  }, [debouncedEmail]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);

    try {
      const trimmedData = {
        username: data.username.trim(),
        email: data.email.trim(),
        password: data.password
      };

      const response = await axios.post<ApiResponse>(`/api/sign-up`, trimmedData);

      toast({
        title: response.data.success ? 'Success' : 'Error',
        description: response.data.message || (response.data.success ? 'Sign up successful' : 'Sign up failed'),
        className: response.data.success ? 'bg-green-500 text-white' : 'bg-red-500 text-white',
      });

      if (response.data.success) {
        const encodedPassword = encodeURIComponent(data.password);
        router.push(`/verify/${encodeURIComponent(data.username)}?password=${encodedPassword}`);
      }

    } catch (error) {
      console.error("Sign-up error:", error);
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message || "An unexpected error occurred. Please try again.";

      toast({
        title: 'Sign-up failed',
        description: errorMessage,
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#1a1f2e] to-black relative overflow-hidden">
      <div className="fixed inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#00000033] rounded-full blur-3xl" />

      <div className="absolute top-4 left-4 z-50 md:top-8 md:left-8">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 px-2 md:px-4 h-8 md:h-10 text-sm md:text-base"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl relative z-10 mx-3 sm:mx-auto">
        <CardHeader className="space-y-4 text-center pt-6 px-4 sm:px-6 sm:pt-8">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-2">
            <User className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Join AnonyExchange
          </CardTitle>
          <p className="text-gray-400 text-sm sm:text-base">
            Sign up to start your anonymous journey
          </p>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm sm:text-base">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                          onChange={(e) => {
                            field.onChange(e);
                            setUsername(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingUsername && (
                      <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-blue-500">
                        <Loader2 className="animate-spin mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Checking...
                      </div>
                    )}
                    {!isCheckingUsername && usernameMessage && (
                      <p className={`text-xs sm:text-sm ${usernameMessage === 'Username is available' ? 'text-green-500' : 'text-red-500'}`}>
                        {usernameMessage}
                      </p>
                    )}
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm sm:text-base">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          type="email"
                          className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingEmail && (
                      <div className="flex items-center mt-1 sm:mt-2 text-xs sm:text-sm text-blue-500">
                        <Loader2 className="animate-spin mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                        Checking...
                      </div>
                    )}
                    {!isCheckingEmail && emailMessage && (
                      <p className={`text-xs sm:text-sm ${emailMessage === '' ? 'text-green-500' : 'text-red-500'}`}>
                        {emailMessage}
                      </p>
                    )}
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300 text-sm sm:text-base">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white hover:bg-transparent h-8 w-8"
                        >
                          {showPassword ?
                            <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> :
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                          }
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs sm:text-sm" />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 pb-6 sm:px-6 sm:pb-8">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-5 sm:py-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:shadow-[0_0_20px_rgba(66,153,225,0.6)] text-sm sm:text-base"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <p className="text-center text-gray-400 text-xs sm:text-sm">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default SignUpPage;