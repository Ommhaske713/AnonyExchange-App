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
          setEmailMessage('');
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
        className: 'bg-green-500 text-white', 
      });
      
      if (response.data.success) {
        router.push(`/verify/${username}`);
      }

    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage = axiosError.response?.data.message;
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
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
      
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] bg-[#00000033] rounded-full blur-3xl" />

      <div className="absolute top-8 left-8 z-50">
        <Button
          variant="ghost"
          className="text-gray-400 hover:text-white hover:bg-white/10"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </div>

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl relative z-10">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-2">
            <User className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Join True Feedback
          </CardTitle>
          <p className="text-gray-400">
            Sign up to start your anonymous journey
          </p>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <CardContent className="space-y-6">
              <FormField
                name="username"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-300">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12"
                          onChange={(e) => {
                            field.onChange(e);
                            setUsername(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingUsername && (
                      <div className="flex items-center mt-2 text-sm text-blue-500">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Checking...
                      </div>
                    )}
                    {!isCheckingUsername && usernameMessage && (
                      <p className={`text-sm ${usernameMessage === 'Username is available' ? 'text-green-500' : 'text-red-500'}`}>
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
                    <FormLabel className="text-gray-300">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          type="email"
                          className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12"
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                        />
                      </div>
                    </FormControl>
                    {isCheckingEmail && (
                      <div className="flex items-center mt-2 text-sm text-blue-500">
                        <Loader2 className="animate-spin mr-2 h-4 w-4" />
                        Checking...
                      </div>
                    )}
                    {!isCheckingEmail && emailMessage && (
                      <p className={`text-sm ${emailMessage === '' ? 'text-green-500' : 'text-red-500'}`}>
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
                    <FormLabel className="text-gray-300">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          className="pl-10 pr-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={togglePasswordVisibility}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white hover:bg-transparent"
                        >
                          {showPassword ? 
                            <EyeOff className="h-5 w-5" /> : 
                            <Eye className="h-5 w-5" />
                          }
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:shadow-[0_0_20px_rgba(66,153,225,0.6)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  'Sign Up'
                )}
              </Button>
              <p className="text-center text-gray-400 text-sm">
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