'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
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

export default function SignIn() {
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const [showPassword, setShowPassword] = useState(false);

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
  const debouncedIdentifier = useDebounce(identifier, 500);

  useEffect(() => {
    const checkIdentifierExists = async () => {
      if (debouncedIdentifier) {
        setIsCheckingIdentifier(true);
        setIdentifierMessage('');
        try {
          await axios.get(`/api/check-identifier?identifier=${debouncedIdentifier}`);
          setIdentifierMessage('User exist with this username/email.');
        } catch (error) {
          const axiosError = error as AxiosError;
          setIdentifierMessage(
            'No user exists with this username/email.'
          );
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
      router.replace('/dashboard');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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
            <Lock className="w-8 h-8 text-blue-400" />
          </div>
          <CardTitle className="text-3xl font-bold text-slate-400 bg-gradient-to-r bg-clip-text ">
            Welcome Back
          </CardTitle>
          <p className="text-gray-400">
            Sign in to continue your anonymous journey
          </p>
        </CardHeader>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Identifier Field */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-gray-300">
                Email/Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="identifier"
                  placeholder="Enter your email or username"
                  {...form.register('identifier')}
                  onChange={(e) => {
                    form.register('identifier').onChange(e);
                    setIdentifier(e.target.value);
                  }}
                  className="pl-10 bg-white/10 border-white/10 text-white focus:ring-blue-500 focus:border-blue-500 rounded-xl h-12"
                />
              </div>
              {isCheckingIdentifier && (
                <div className="flex items-center mt-2 text-sm text-blue-500">
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Checking...
                </div>
              )}
              {identifierMessage && (
                <p
                  className={`text-sm ${identifierMessage === 'User exist with this username/email.'
                    ? 'text-green-500'
                    : 'text-red-500'
                    }`}
                >
                  {identifierMessage}
                </p>
              )}
              {form.formState.errors.identifier && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.identifier.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...form.register('password')}
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
              {form.formState.errors.password && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="data-[state=checked]:bg-blue-500 border-white/20" />
                <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                  Remember me
                </label>
              </div>
              <Link href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-6 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-[0_0_15px_rgba(66,153,225,0.4)] hover:shadow-[0_0_20px_rgba(66,153,225,0.6)]"
            >
              Sign In
            </Button>
            <p className="text-center text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/sign-up" className="text-blue-400 hover:text-blue-300 transition-colors">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}