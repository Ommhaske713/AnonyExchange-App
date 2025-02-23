'use client';

import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2, MessageSquare, Send, Sparkles, RefreshCw, MousePointerClick } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schema/messageSchema';
import { cn } from '@/lib/utils';

const specialChar = '||';
const parseStringMessages = (messageString: string): string[] => 
  messageString?.split(specialChar).filter((msg) => msg.trim() !== '') || [];

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const { username } = useParams<{ username: string }>();
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>(parseStringMessages(initialMessageString));
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggestError, setIsSuggestError] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 500;

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

      toast({ title: 'Success!', description: response.message, variant: 'default' });
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
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-8 mt-14">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
            Send Anonymous Message
          </h1>
          <p className="text-slate-300">
            Your message will be delivered anonymously to <span className="font-medium text-blue-300">@{username}</span>
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" /> Need Inspiration?
            </h2>
            <Button
              onClick={fetchSuggestedMessages}
              variant="outline"
              size="sm"
              className="text-slate-200 hover:bg-slate-700/50 hover:text-white border-slate-600 flex items-center gap-2"
              disabled={isSuggestLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isSuggestLoading && "animate-spin")} />
              {isSuggestLoading ? "Loading..." : "New Ideas"}
            </Button>
          </div>

          {isSuggestError ? (
            <p className="text-red-400">Unable to load message suggestions. Please try again later.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {suggestedMessages.map((message, index) => (
                <Card 
                  key={index} 
                  className="bg-slate-700/30 hover:bg-slate-700/50 border-slate-600 transition-all duration-200 cursor-pointer group overflow-hidden relative"
                  onClick={() => handleMessageClick(message)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <p className="text-slate-200 font-medium">{message}</p>
                    <div className="flex items-center space-x-2 text-slate-400 group-hover:text-slate-200">
                      <MousePointerClick className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-sm italic opacity-0 group-hover:opacity-100 transition-opacity">Use this</span>
                    </div>
                  </CardContent>
                  <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 to-purple-500 absolute bottom-0 left-0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-in-out origin-left"></div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-md border border-slate-700 shadow-xl overflow-hidden">
          <CardHeader className="pb-2 pt-6 px-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-400" /> 
                Your Message
              </h2>
              <span className={cn(
                "text-sm font-medium",
                charCount > MAX_CHARS * 0.8 ? "text-yellow-400" : "text-slate-400",
                charCount > MAX_CHARS ? "text-red-400" : ""
              )}>
                {charCount}/{MAX_CHARS}
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField control={form.control} name="content" render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Write your anonymous message here..."
                          className="bg-slate-700/50 border-slate-600 text-white text-lg placeholder:text-slate-400 
                            resize-none min-h-[180px] focus:border-blue-400 focus:ring-blue-400/20 p-4 leading-relaxed
                            rounded-lg shadow-inner transition-all duration-200 focus:shadow-blue-500/10"
                          maxLength={MAX_CHARS}
                          {...field}
                        />
                        <div className="absolute inset-0 pointer-events-none border-2 border-transparent rounded-lg 
                          transition-all duration-300 group-focus-within:border-blue-400/50"></div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400 mt-2" />
                  </FormItem>
                )} />
                
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-sm italic">Express yourself freely, your identity is protected.</p>
                  <Button
                    type="submit"
                    disabled={isLoading || !form.watch('content') || charCount > MAX_CHARS}
                    className={cn(
                      "relative overflow-hidden transition-all duration-300 px-6 py-2.5 text-base font-medium",
                      isSubmitSuccessful 
                        ? "bg-green-500 hover:bg-green-600" 
                        : "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-indigo-500/30"
                    )}
                  >
                    {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
                    {isLoading ? 'Sending...' : isSubmitSuccessful ? 'Sent!' : 'Send Message'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-slate-400 text-sm">
            Need more ideas? Click the "New Ideas" button to get fresh suggestions.
          </p>
        </div>
      </div>
    </main>
  );
}