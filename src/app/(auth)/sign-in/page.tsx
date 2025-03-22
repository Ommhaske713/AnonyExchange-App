'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import axios, { AxiosError } from 'axios';
import { Loader2, Mail, Lock, ArrowLeft, User, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { signInSchema } from '@/schema/signInSchema';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const [identifier, setIdentifier] = useState('');
  const [identifierMessage, setIdentifierMessage] = useState('');
  const [isCheckingIdentifier, setIsCheckingIdentifier] = useState(false);
  const debouncedIdentifier = useDebounce(identifier, 600);

  useEffect(() => {
    const checkIdentifierExists = async () => {
      if (debouncedIdentifier && debouncedIdentifier.length >= 3) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setIsCheckingIdentifier(true);
        setIdentifierMessage('');

        try {
          await axios.get(`/api/check-identifier?identifier=${encodeURIComponent(debouncedIdentifier.trim())}`, {
            signal,
            timeout: 5000
          });

          if (!signal.aborted) {
            setIdentifierMessage('User exist with this username/email.');
          }
        } catch (error) {
          if (axios.isCancel(error)) {
            return;
          }

          const axiosError = error as AxiosError;

          if (!signal.aborted) {
            if (axiosError.response?.status === 404) {
              setIdentifierMessage('No user exists with this username/email.');
            } else if (axiosError.code === 'ECONNABORTED') {
              setIdentifierMessage('Request timed out. Please try again.');
            } else {
              console.error("Error checking identifier:", axiosError);
              setIdentifierMessage('');
            }
          }
        } finally {
          if (!signal.aborted) {
            setIsCheckingIdentifier(false);
          }
        }
      } else if (debouncedIdentifier.length === 0) {
        setIdentifierMessage('');
      }
    };

    checkIdentifierExists();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedIdentifier]);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const verified = searchParams.get('verified');
    const username = searchParams.get('username');

    if (verified === 'true' && username) {
      form.setValue('identifier', decodeURIComponent(username));

      toast({
        title: 'Account Verified',
        description: 'Your account has been verified. Please sign in to continue.',
        className: 'bg-green-500 text-white',
      });
    }
  }, []);

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
          className: 'bg-red-500 text-white',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          className: 'bg-red-500 text-white',
        });
      }
    }

    if (result?.url) {
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        className: 'bg-green-500 text-white',
      });
      setTimeout(() => {
        router.replace('/dashboard');
      }, 1500);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-3 sm:px-6 py-10 sm:py-16 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#1a1f2e] to-black relative overflow-hidden">

      <div className="fixed inset-0 bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />

      <div className="absolute top-1/3 -left-1/4 sm:top-1/4 sm:left-1/4 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] bg-blue-500/20 rounded-full blur-3xl float" />

      <div className="absolute -bottom-1/4 right-0 sm:bottom-1/4 sm:right-1/4 w-[150px] h-[150px] sm:w-[250px] sm:h-[250px] bg-[#00000033] rounded-full blur-3xl float"
        style={{ animationDelay: "-4s" }}
      />

      <div className="absolute top-2 left-2 z-50 md:top-8 md:left-8">
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

      <Card className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl sm:rounded-3xl relative z-10">
        <CardHeader className="space-y-3 sm:space-y-4 text-center pb-4 sm:pb-6 border-b border-white/5">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-1 sm:mb-2">
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text">
            Welcome Back
          </CardTitle>
          <p className="text-gray-400 text-sm sm:text-base">
            Sign in to continue your anonymous journey
          </p>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 pt-4 sm:pt-6">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="identifier" className="text-gray-300 text-sm">
                Username/Email
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" />
                <Input
                  id="identifier"
                  placeholder="Enter your email or username"
                  {...form.register('identifier')}
                  onChange={(e) => {
                    form.register('identifier').onChange(e);
                    setIdentifier(e.target.value);
                  }}
                  className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-10 sm:h-12 input-animated text-sm sm:text-base"
                />
              </div>
              {isCheckingIdentifier && (
                <div className="flex items-center mt-1 text-xs sm:text-sm text-blue-500">
                  <Loader2 className="animate-spin mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Checking...
                </div>
              )}
              {identifierMessage && (
                <p
                  className={`text-xs sm:text-sm ${identifierMessage === 'User exist with this username/email.'
                    ? 'text-green-500'
                    : 'text-red-500'
                    }`}
                >
                  {identifierMessage}
                </p>
              )}
              {form.formState.errors.identifier && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-gray-300 text-sm">
                Password
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors duration-200" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register('password')}
                  className="pl-10 pr-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-10 sm:h-12 input-animated text-sm sm:text-base"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={togglePasswordVisibility}
                  className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white hover:bg-transparent h-8 w-8 sm:h-10 sm:w-10"
                >
                  {showPassword ?
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> :
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                  }
                </Button>
              </div>
              {form.formState.errors.password && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center space-x-2" >
                <Checkbox id="remember" className="h-4 w-4 data-[state=checked]:bg-blue-500 border-white/20" />
                <label htmlFor="remember" className="text-xs sm:text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
                  Remember me
                </label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6 pt-2 sm:pt-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 sm:py-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:shadow-[0_0_20px_rgba(66,153,225,0.6)] text-sm sm:text-base"
              >
                Sign In
              </Button>
            </motion.div>
            <p className="text-center text-gray-400 text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}