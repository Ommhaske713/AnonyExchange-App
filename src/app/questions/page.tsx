'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Message } from '@/model/User';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
  Loader2, MessageCircle, Lock, Home, ArrowLeft, Calendar,
  RefreshCw, Filter, CheckCircle2, Circle, ChevronDown, SearchIcon, User
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSearchParams, useRouter } from 'next/navigation';

export default function QuestionsPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOption, setFilterOption] = useState<'all' | 'answered' | 'unanswered'>('answered');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const usernameParam = searchParams.get('username');

  useEffect(() => {
    if (usernameParam) {
      setUsernameInput(usernameParam);
      fetchMessagesByUsername(usernameParam);
    } else if (status === 'authenticated') {
      fetchUserMessages();
    } else if (status === 'unauthenticated') {
      setIsLoading(false);
    }
  }, [status, usernameParam]);

  const fetchUserMessages = async () => {
    try {
      setError(null);
      setIsRefreshing(true);
      const response = await axios.get('/api/public-messages');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }

      setMessages(response.data.messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchMessagesByUsername = async (username: string) => {
    try {
      setError(null);
      setIsRefreshing(true);
      const response = await axios.get(`/api/public-messages?username=${username}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch messages');
      }

      setMessages(response.data.messages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load messages';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      router.push(`/questions?username=${encodeURIComponent(usernameInput.trim())}`);
      fetchMessagesByUsername(usernameInput.trim());
    }
  };

  const getFilteredMessages = () => {
    if (filterOption === 'all') {
      return [...messages].sort((a, b) => {
        if (a.reply && !b.reply) return -1;
        if (!a.reply && b.reply) return 1;

        const dateA = a.reply ? new Date(a.repliedAt || 0) : new Date(a.createdAt);
        const dateB = b.reply ? new Date(b.repliedAt || 0) : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      });
    } else if (filterOption === 'answered') {
      return [...messages]
        .filter(message => !!message.reply)
        .sort((a, b) => new Date(b.repliedAt || 0).getTime() - new Date(a.repliedAt || 0).getTime());
    } else {
      return [...messages]
        .filter(message => !message.reply)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  };

  const filteredMessages = getFilteredMessages();

  const displayUsername = usernameParam || (session?.user as any)?.username || "";

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <header className="sticky top-0 z-10 backdrop-blur-lg bg-slate-900/70 border-b border-white/5 shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ margin: "-1px 0px 0px -260px" }}>
              <Link href="/">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800">
                  <ArrowLeft className="h-5 w-5 text-slate-300" />
                </Button>
              </Link>
              <h1 className="text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400">
                {usernameParam ? `@${usernameParam}'s Q&A` : "Q&A History"}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {(usernameParam || status === 'authenticated') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-600"
                  onClick={() => usernameParam ? fetchMessagesByUsername(usernameParam) : fetchUserMessages()}
                  disabled={isRefreshing}
                  style={{ margin: "1px -260px 0px 149px" }}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>
              )}

              {status === 'authenticated' && !usernameParam && (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto py-8 px-4">
          {status === 'unauthenticated' && !usernameParam && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 max-w-lg mx-auto mt-12"
            >
              <div className="text-center mb-6">
                <User className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Find User Q&A</h2>
                <p className="text-slate-400">
                  Enter a username to see their questions and answers
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                  <Input
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="username"
                    className="pl-8 bg-slate-800/50 border-slate-700 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!usernameInput.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <SearchIcon className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-slate-300">Loading messages...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className="p-8 text-center bg-red-900/20 border border-red-500/20 rounded-xl max-w-lg mx-auto">
              <p className="text-red-300 font-medium">{error}</p>
              <Button
                variant="outline"
                className="mt-4 border-red-500/30 text-red-300 hover:bg-red-500/10"
                onClick={() => status === 'authenticated' ? fetchUserMessages() : {}}
              >
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (usernameParam || status === 'authenticated') && (
            <div className="p-8 text-center bg-slate-800/50 border border-slate-700/50 rounded-xl max-w-lg mx-auto">
              <MessageCircle className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-white font-medium">
                {usernameParam ? `@${usernameParam} has no messages yet` : "You haven't received any messages yet"}
              </p>
              <p className="text-sm text-slate-400 mt-2">
                {usernameParam ?
                  `When someone sends them a message and they reply, it will appear here` :
                  `Share your profile to start receiving messages`
                }
              </p>
            </div>
          )}

          {!isLoading && !error && messages.length > 0 && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-9">
                <div>
                  <h2 className="text-xl font-serif text-white">
                    {usernameParam ? `@${usernameParam}'s Q&A` : "Your Questions & Answers"}
                  </h2>
                  <p className="text-slate-400 text-sm">
                    Showing {filteredMessages.length} {filterOption !== 'all' ? filterOption : ''}
                    {filteredMessages.length === 1 ? ' question' : ' questions'}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="border-slate-700 text-slate-600">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterOption === 'all' ? 'All Questions' :
                        filterOption === 'answered' ? 'Answered Only' : 'Unanswered Only'}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-slate-800 border-slate-700 text-slate-300">
                    <DropdownMenuLabel>Select Preference</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-slate-700" />

                    <DropdownMenuItem
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        filterOption === 'all' && "text-blue-400"
                      )}
                      onClick={() => setFilterOption('all')}
                    >
                      {filterOption === 'all' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      All Questions
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        filterOption === 'answered' && "text-blue-400"
                      )}
                      onClick={() => setFilterOption('answered')}
                    >
                      {filterOption === 'answered' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Answered Only
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className={cn(
                        "flex items-center gap-2 cursor-pointer",
                        filterOption === 'unanswered' && "text-blue-400"
                      )}
                      onClick={() => setFilterOption('unanswered')}
                    >
                      {filterOption === 'unanswered' ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                      Unanswered Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid gap-6">
                {filteredMessages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.3 }}
                  >
                    <Card className={cn(
                      "bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden",
                      !message.reply && "border-l-2 border-l-amber-500"
                    )}>
                      <div className={cn(
                        "absolute top-0 left-0 w-1 h-full bg-gradient-to-b",
                        message.reply ? "from-blue-500 to-indigo-600" : "from-amber-500 to-orange-600"
                      )}></div>
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-2">
                            <CardTitle className="text-xl text-white">
                              {message.content}
                            </CardTitle>
                            {!message.reply && (
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 mt-1 ml-1">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-slate-800/50 text-xs text-slate-400 border-slate-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(message.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {message.reply ? (
                          <div className="mt-4">
                            <Separator className="my-4 bg-slate-700/50" />
                            <div className="bg-blue-500/10 rounded-lg p-5 border border-blue-500/20">
                              <div className="flex justify-between items-start mb-3">
                                <Badge className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 border-none">
                                  @{message.username}'s Answer
                                </Badge>
                                <p className="text-xs text-slate-400">
                                  {new Date(message.repliedAt!).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <p className="text-white mt-2 whitespace-pre-wrap leading-relaxed">{message.reply}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center justify-center p-4">
                            <p className="text-slate-400 text-sm italic">Waiting for answer...</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </main>
        <div className="text-center mt-6 " >
          <p className="text-slate-400 text-sm mb-2">
            Need more ideas? Click the "New Ideas" button to get fresh suggestions.
          </p>
          <p className="text-slate-400 text-sm">
            New here? <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors underline underline-offset-2">
              Try this app
            </Link> by going to the homepage first and setting up your account.
          </p>
        </div>
      </div>
    </>
  );
}