'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, MessageSquare, Send, Sparkles, RefreshCw, MousePointerClick, History, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schema/messageSchema';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const specialChar = '||';
const parseStringMessages = (messageString: string): string[] =>
  messageString?.split(specialChar).filter((msg) => msg.trim() !== '') || [];

const staticInitialMessage = "If you could master any skill overnight, what would you choose and why?||What's something you think is completely overrated that most people love?||What's the weirdest food combination you enjoy that others find disgusting?";

const allPossibleQuestions = [
  "If you could master any skill overnight, what would you choose and why?",
  "What's something you think is completely overrated that most people love?",
  "What's the weirdest food combination you enjoy that others find disgusting?",
  "If you could travel anywhere in the world right now, where would you go?",
  "What's a movie or TV show you can watch over and over without getting tired of it?",
  "What's one thing you wish more people knew about you?",
  "If you could have dinner with any historical figure, who would it be and why?",
  "What's your unpopular opinion that you're willing to defend?",
  "If you could instantly become an expert in something, what would it be?",
  "What's the best piece of advice you've ever received?",
  "What's something you're looking forward to in the near future?",
  "If you could live in any fictional world, which would you choose?",
  "What's a small thing that makes your day better?",
  "What three items would you bring to a deserted island?",
  "What's something you think will be completely different in 10 years?"
];

const getRandomQuestions = (count = 3) => {
  const shuffled = [...allPossibleQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length)).join(specialChar);
};

export default function SendMessage() {
  const { username } = useParams<{ username: string }>();
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(parseStringMessages(staticInitialMessage));
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestError, setIsSuggestError] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;

  useEffect(() => {
    setSuggestedMessages(parseStringMessages(getRandomQuestions(3)));
  }, []);

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
  } = useCompletion({
    api: '/api/suggest-messages',
    onResponse: (res) => {
      if (res.status === 200) setIsSuggestError(false);
    },
    onError: () => setIsSuggestError(true),
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.content) {
        setCharCount(value.content.length);
      } else {
        setCharCount(0);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  useEffect(() => {
    if (completion) setSuggestedMessages(parseStringMessages(completion));
  }, [completion]);

  const fetchSuggestedMessages = async () => {
    setIsSuggestError(false);
    try {
      const response = await axios.post('/api/suggest-messages');
      if (response.status === 200) {
        setSuggestedMessages(parseStringMessages(response.data.text));
      } else {
        setIsSuggestError(true);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      setIsSuggestError(true);
    }
  };

  const handleMessageClick = (message: string) => {
    form.setValue('content', message, { shouldValidate: true });
    setCharCount(message.length);
  };

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const { data: response } = await axios.post<ApiResponse>('/api/send-message', { ...data, username });

      toast({
        title: 'Success!',
        description: response.message,
        variant: 'default',
        className: 'bg-green-500 text-white',
      });
      form.reset();
      setCharCount(0);
      setIsSubmitSuccessful(true);
      setTimeout(() => setIsSubmitSuccessful(false), 3000);
      fetchSuggestedMessages();
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message || 'Failed to send message',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
    }
  };


return (
  <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-6 px-3 sm:py-12 sm:px-4">
    <div className="max-w-3xl mx-auto space-y-5 sm:space-y-8">
      <div className="text-center space-y-2 sm:space-y-3">
        <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
          Send Anonymous Message
        </h1>
        <p className="text-slate-300 text-sm sm:text-base">
          To <span className="font-medium text-blue-300">@{username}</span>
        </p>
        <div className="pt-1 sm:pt-2">
          <Link href="/questions">
            <Button
              variant="ghost"
              className="text-slate-300 hover:text-white hover:bg-slate-700/50 flex items-center gap-1.5 sm:gap-2 mx-auto text-xs sm:text-base py-1"
            >
              <History className="h-3 w-3 sm:h-4 sm:w-4" />
              View Message History
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-2.5 sm:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-xl font-semibold text-white flex items-center gap-1.5 sm:gap-2">
            <Sparkles className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-purple-400" /> Any Questions ?
          </h2>
          <Button
            onClick={fetchSuggestedMessages}
            variant="outline"
            size="sm"
            className="text-slate-200 bg-slate-700/50 hover:text-slate-700 border-slate-600 flex items-center gap-1 sm:gap-2 text-[11px] sm:text-sm px-2 sm:px-3"
            disabled={isSuggestLoading}
          >
            <RefreshCw className={cn("h-3 w-3 sm:h-4 sm:w-4", isSuggestLoading && "animate-spin")} />
            {isSuggestLoading ? "Loading..." : "New Ideas"}
          </Button>
        </div>

        {isSuggestError ? (
          <p className="text-red-400 text-xs sm:text-sm">Unable to load message suggestions. Please try again later.</p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-3">
            {suggestedMessages.map((message, index) => (
              <Card
                key={index}
                className="bg-slate-700/30 hover:bg-slate-700/50 border-slate-600 transition-all duration-200 cursor-pointer group overflow-hidden relative"
                onClick={() => handleMessageClick(message)}
              >
                <CardContent className="p-2.5 sm:p-4 flex items-center justify-between">
                  <p className="text-slate-200 font-medium text-xs sm:text-base line-clamp-2 sm:line-clamp-none">
                    {message}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex items-center space-x-1 sm:space-x-2 text-slate-400 group-hover:text-slate-200">
                    <MousePointerClick className="h-3 w-3 sm:h-4 sm:w-4 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="text-xs hidden sm:inline opacity-0 group-hover:opacity-100 transition-opacity">Use this</span>
                  </div>
                </CardContent>
                <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 to-purple-500 absolute bottom-0 left-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left"></div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl overflow-hidden">
        <CardHeader className="pb-1 pt-3 sm:pt-6 px-3 sm:px-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base sm:text-xl font-semibold text-white flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-blue-400" />
              Your Message
            </h2>
            <span className={cn(
              "text-[11px] sm:text-sm font-medium",
              charCount > MAX_CHARS * 0.8 ? "text-yellow-400" : "text-slate-400",
              charCount > MAX_CHARS ? "text-red-400" : ""
            )}>
              {charCount}/{MAX_CHARS}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3 sm:space-y-5">
              <FormField control={form.control} name="content" render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        placeholder="Write your anonymous message here..."
                        className="bg-slate-700/50 border-slate-600 text-white text-sm sm:text-lg placeholder:text-slate-400 
                          resize-none min-h-[120px] sm:min-h-[180px] focus:border-blue-400 focus:ring-blue-400/20 p-3 sm:p-4 leading-relaxed
                          rounded-lg shadow-inner transition-all duration-200 focus:shadow-blue-500/10"
                        maxLength={MAX_CHARS}
                        {...field}
                      />
                      <div className="absolute inset-0 pointer-events-none border-2 border-transparent rounded-lg 
                        transition-all duration-300 group-focus-within:border-blue-400/50"></div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400 mt-1.5 sm:mt-2 text-[11px] sm:text-sm" />
                </FormItem>
              )} />

              <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-2">
                <div className="flex items-center space-x-2 justify-center sm:justify-start">
                  <Shield className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-green-600"/>
                  <p className="text-slate-400 text-[11px] sm:text-sm italic">Your identity is protected.</p>
                </div>
                
                <Button
                  type="submit"
                  disabled={isLoading || !form.watch('content') || charCount > MAX_CHARS}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium w-full sm:w-auto",
                    isSubmitSuccessful
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-indigo-500/30"
                  )}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Send className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                  {isLoading ? 'Sending...' : isSubmitSuccessful ? 'Sent!' : 'Send Message'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="bg-blue-500/10 border border-blue-500/20 p-3 sm:p-4 rounded-lg shadow-md shadow-blue-500/5">
        <div className="flex items-start gap-2.5 sm:gap-3">
          <div className="text-blue-400 flex-shrink-0 mt-0.5 bg-blue-500/10 p-1.5 rounded-full">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <div>
            <h3 className="text-blue-300 font-medium text-xs sm:text-sm">Privacy Guaranteed</h3>
            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5 sm:mt-1">All messages are encrypted and your identity is never revealed to the recipient.</p>
          </div>
        </div>
      </Card>

      <div className="text-center mt-4 sm:mt-6 px-0 sm:px-4">
        <p className="text-slate-400 text-xs sm:text-sm mb-2 sm:mb-3">
          Need more ideas? Tap the "New Ideas" button for fresh suggestions.
        </p>
        <p className="text-slate-400 text-xs sm:text-sm">
          New here? <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors font-medium px-1 py-1.5 -my-1.5 inline-flex items-center" style={{textDecoration:"none"}}>
            Try this app
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-3.5 sm:w-3.5 ml-1 transform translate-y-px" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link> by going to the homepage first.
        </p>
      </div>

      <footer className="mt-6 sm:mt-14">
        <Separator className="bg-slate-700/50 my-3 sm:my-6" />
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row justify-between sm:gap-4 items-center px-0 sm:px-2">
          <p className="text-slate-500 text-[11px] sm:text-sm">
            © 2025 AnonyExchange • All rights reserved
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex space-x-3 sm:space-x-4">
              <Link href="" className="text-slate-400 hover:text-slate-300 text-[11px] sm:text-sm transition-colors py-1">
                Privacy Policy
              </Link>
              <Link href="" className="text-slate-400 hover:text-slate-300 text-[11px] sm:text-sm transition-colors py-1">
                Terms of Use
              </Link>
            </div>
            <div className="flex items-center">
              <span className="inline-block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-green-500 mr-1.5 sm:mr-2 animate-pulse"></span>
              <span className="text-slate-400 text-[10px] sm:text-sm">End-to-end encrypted</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  </main>
);
}