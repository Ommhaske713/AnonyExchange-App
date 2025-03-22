'use client'

import React, { useEffect, useState, Suspense } from 'react';
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

// Create a client component that uses useSearchParams
function QuestionsContent() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isQuestionsDisabled, setIsQuestionsDisabled] = useState(false); 
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterOption, setFilterOption] = useState<'all' | 'answered' | 'unanswered'>('answered');
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [visibilityStatus, setVisibilityStatus] = useState<boolean | undefined>(undefined);
  const [isVisibilityLoading, setIsVisibilityLoading] = useState(true);
  const [isVisibilityUpdating, setIsVisibilityUpdating] = useState(false);
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

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Session user data:', session?.user);
    }
  }, [session, status]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      setVisibilityStatus((session.user as any)?.showQuestions);
    }
  }, [session, status]);

  const fetchVisibilityStatus = async () => {
    if (status === 'authenticated') {
      try {
        setIsVisibilityLoading(true);
        const response = await axios.get('/api/user-visibility');
        console.log('Visibility status from DB:', response.data.showQuestions);
        setVisibilityStatus(response.data.showQuestions);
      } catch (error) {
        console.error('Failed to fetch visibility status:', error);
        setVisibilityStatus((session?.user as any)?.showQuestions);
      } finally {
        setIsVisibilityLoading(false);
      }
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchVisibilityStatus();
    }
  }, [status]);

  const handleRefresh = () => {
    if (usernameParam) {
      fetchMessagesByUsername(usernameParam);
    } else if (status === 'authenticated') {
      fetchUserMessages();
      fetchVisibilityStatus(); 
    }
  };

  const fetchUserMessages = async () => {
    try {
      setError(null);
      setIsQuestionsDisabled(false);
      setIsRefreshing(true);
      
      const response = await axios.get('/api/public-messages');

      setMessages(response.data.messages);
    } catch (error: any) {

      if (error.response) {
        if (error.response.status === 403) {
          setIsQuestionsDisabled(true);
          setError('The user has disabled public viewing of their questions.');
        } else {
          setError(error.response.data.message || 'Failed to load messages');
        }
      } else {
        setError('Failed to connect to server. Please try again later.');
      }
      
      toast({
        title: 'Questions Not Available',
        description: isQuestionsDisabled 
          ? 'The user has disabled public questions viewing.'
          : (error.response?.data?.message || 'Failed to load messages'),
        variant: 'destructive',
        className: isQuestionsDisabled ? 'bg-amber-600 text-white' : 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchMessagesByUsername = async (username: string) => {
    try {
      setError(null);
      setIsQuestionsDisabled(false);
      setIsRefreshing(true);
      
      const response = await axios.get(`/api/public-messages?username=${username}`);

      setMessages(response.data.messages);
    } catch (error: any) {

      if (error.response) {
        if (error.response.status === 403) {
          setIsQuestionsDisabled(true);
          setError(`@${username} has disabled public viewing of their questions.`);
        } else {
          setError(error.response.data.message || 'Failed to load messages');
        }
      } else {
        setError('Failed to connect to server. Please try again later.');
      }

      toast({
        title: 'Questions Not Available',
        description: isQuestionsDisabled 
          ? `@${username} has disabled public viewing of their questions.`
          : (error.response?.data?.message || 'Failed to load messages'),
        variant: 'destructive',
        className: isQuestionsDisabled ? 'bg-amber-600 text-white' : 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usernameInput.trim()) {
      setError(null);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <header className="top-0 z-10 backdrop-blur-lg bg-slate-900/80 border-b border-white/10 shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 lg:ml-[-200px] lg:mt-[2px]">
                  <Link href="/">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800/70 transition-colors">
                      <ArrowLeft className="h-5 w-5 text-slate-300" />
                    </Button>
                  </Link>
                  <h1 className="text-xl md:text-2xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-400 font-semibold">
                    {usernameParam ? `@${usernameParam}'s Q&A and Messages` : "Public Q&A and Messages Board"}
                  </h1>
                </div>

                <div className="flex items-center md:hidden gap-2">
                  {status === 'authenticated' && (
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white h-9 px-2">
                        <Home className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {(usernameParam || status === 'authenticated') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="h-9 px-2 text-slate-400"
                    >
                      <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex flex-1 items-center gap-2">
                <form onSubmit={handleSubmit} className="flex flex-1">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">@</span>
                    <Input
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Search username"
                      className="pl-8 bg-slate-800/50 border-slate-700 focus:border-blue-500 text-white h-9 rounded-r"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!usernameInput.trim()}
                    className="bg-blue-600 hover:bg-blue-700 h-9 rounded-l ml-2"
                  >
                    <SearchIcon className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Search</span>
                  </Button>
                </form>

                <div className="hidden md:flex items-center gap-2 ml-2">
                  {(usernameParam || status === 'authenticated') && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-slate-700 text-slate-500 hover:text-black hover:border-slate-500"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                    >
                      <RefreshCw className={cn("h-4 w-4 mr-1", isRefreshing && "animate-spin")} />
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                  )}

                  {status === 'authenticated' && (
                    <Link href="/dashboard">
                      <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700/50">
                        <Home className="h-4 w-4 mr-1" />
                        Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto py-8 px-4 flex-grow pb-24 lg:pb-64">
          {status === 'authenticated' && (
            <div className={cn(
              "mb-6 p-3 rounded-lg flex items-center justify-between text-sm border",
              isVisibilityLoading 
                ? "bg-slate-800/50 border-slate-700/50 text-slate-400"
                : visibilityStatus === true
                  ? "bg-green-900/20 border-green-500/30 text-green-300" 
                  : "bg-amber-900/20 border-amber-500/30 text-amber-300"
            )}>
              <div className="flex items-center">
                {isVisibilityLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading visibility settings...
                  </>
                ) : visibilityStatus === true ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Others can see your content
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Only you can see your content
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {isVisibilityUpdating && (
                  <div className="flex items-center text-xs text-slate-400">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Updating...
                  </div>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={fetchVisibilityStatus} 
                  disabled={isVisibilityLoading}
                  className="h-7 w-7 p-0 rounded-full"
                >
                  <RefreshCw className={cn("h-3 w-3", isVisibilityLoading && "animate-spin")} />
                  <span className="sr-only">Refresh visibility status</span>
                </Button>
              </div>
            </div>
          )}

          {status === 'unauthenticated' && !usernameParam && !isLoading && !error && messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-lg mx-auto mt-12"
            >
              <div className="text-center mb-6">
                <MessageCircle className="h-16 w-16 mx-auto text-blue-400 mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">Welcome to the Public Q&A and Messages Board</h2>
                <p className="text-slate-400">
                  Search for a username to view their questions,answers and messages.
                </p>
              </div>

              <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700/50 flex items-center">
                <SearchIcon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
                <p className="text-sm text-slate-300">
                  Use the search bar above to find any user's public Q&A and message history. Try searching for popular usernames or your friends.
                </p>
              </div>
            </motion.div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
              <span className="ml-3 text-slate-300">Loading messages...</span>
            </div>
          )}

          {!isLoading && error && (
            <div className={cn(
              "p-20 text-center border rounded-xl max-w-lg mx-auto h-80",
              isQuestionsDisabled 
                ? "bg-amber-900/20 border-amber-500/20" 
                : "bg-red-900/20 border-red-500/20"
            )}>
              <div className="flex flex-col items-center justify-center h-full">
                {isQuestionsDisabled ? (
                  <>
                    <Lock className="h-16 w-16 text-amber-500 mb-6" />
                    <h3 className="text-xl font-medium text-amber-300 mb-3">Questions Not Available</h3>
                  </>
                ) : (
                  <MessageCircle className="h-16 w-16 text-red-400 mb-6" />
                )}
                <p className={cn(
                  "font-medium mb-6",
                  isQuestionsDisabled ? "text-amber-300" : "text-red-300"
                )}>
                  {error}
                </p>
                
                {isQuestionsDisabled && usernameParam ? (
                  <div className="space-y-4">
                    <p className="text-sm text-amber-400/70">
                      Try searching for another user who has enabled public questions.
                    </p>
                    <Button
                      variant="outline"
                      className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                      onClick={() => {
                        setUsernameInput('');
                        router.push('/questions');
                        setTimeout(() => {
                          const searchInput = document.querySelector('input[placeholder="Search username"]');
                          if (searchInput instanceof HTMLInputElement) searchInput.focus();
                        }, 100);
                      }}
                    >
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search Another User
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    className={cn(
                      "mt-4",
                      isQuestionsDisabled 
                        ? "border-amber-500/30 text-amber-300 hover:bg-amber-500/10" 
                        : "border-red-500/30 text-red-300 hover:bg-red-500/10"
                    )}
                    onClick={() => {
                      if (usernameParam) {
                        fetchMessagesByUsername(usernameParam);
                      } else {
                        setError(null);
                        setMessages([]);
                        setIsLoading(false);
                        setTimeout(() => {
                          const searchInput = document.querySelector('input[placeholder="Search username"]');
                          if (searchInput instanceof HTMLInputElement) searchInput.focus();
                        }, 100);
                      }
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {usernameParam ? "Try Again" : "Search for a User"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {!isLoading && !error && messages.length === 0 && (usernameParam || status === 'authenticated') && (
            <div className="p-24 text-center bg-slate-800/50 border border-slate-700/50 rounded-xl max-w-lg mx-auto">
              <MessageCircle className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-white font-medium">
                {usernameParam ? `@${usernameParam} has no messages yet` : "You haven't received any messages yet"}
              </p>
              <p className="text-sm text-slate-400 mt-2 mb-6">
                {usernameParam ?
                  `When someone sends them a message and they reply, it will appear here` :
                  `Share your profile to start receiving messages`
                }
              </p>

              {usernameParam && (
                <div className="border-t border-slate-700/50 pt-6">
                  <p className="text-sm text-blue-300 mb-4">Try searching for another user</p>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
                      onClick={() => {
                        setUsernameInput('');
                        router.push('/questions');
                        setTimeout(() => {
                          const searchInput = document.querySelector('input[placeholder="Search username"]');
                          if (searchInput instanceof HTMLInputElement) searchInput.focus();
                        }, 100);
                      }}
                    >
                      <SearchIcon className="h-4 w-4 mr-2" />
                      Search Another User
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && messages.length > 0 && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-9">
                <div>
                  <h2 className="text-xl font-serif text-white">
                    {usernameParam ? `@${usernameParam}'s Q&A and Messages` : "Community Questions & Answers"}
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
                        filterOption === 'answered' ? 'Answered' : 'Not Answered'}
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
                      Answered
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
                    transition={{ delay: index * 0.35 }}
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
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
                          <div className="flex items-start gap-2">
                            <CardTitle className="text-lg sm:text-xl text-white">
                              {message.content}
                            </CardTitle>
                            {!message.reply && (
                              <Badge variant="outline" className="bg-amber-500/20 text-amber-300 border-amber-500/30 mt-1 ml-1 whitespace-nowrap">
                                Pending
                              </Badge>
                            )}
                          </div>
                          <Badge variant="outline" className="bg-slate-800/50 text-xs text-slate-400 border-slate-700 self-start sm:self-auto mt-1 sm:mt-0" style={{margin: "4px -8px 11px 15px"}}>
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
                            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-lg p-3 sm:p-5 border border-blue-500/20 shadow-inner">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0 mb-3">
                                <Badge className="bg-blue-500/30 hover:bg-blue-500/40 text-blue-200 border-none self-start">
                                  <MessageCircle className="h-3 w-3 mr-1" /> @{message.username}'s Answer
                                </Badge>
                                <p className="text-xs text-slate-400 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(message.repliedAt!).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </p>
                              </div>
                              <p className="text-white mt-3 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{message.reply}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center justify-center p-4 sm:p-6 bg-slate-800/30 rounded-lg border border-slate-700/30">
                            <Loader2 className="h-4 w-4 text-amber-500 animate-spin mr-2" />
                            <p className="text-slate-400 text-sm">Waiting for answer...</p>
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

        <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-md w-full mt-auto">
          <div className="hidden lg:block lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-10 bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
              <div className="grid grid-cols-3 gap-8 md:ml-28">
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">AnonyExchange Community</h3>
                  <p className="text-slate-400 text-sm">
                    Share knowledge, receive thoughtful responses, and engage with a growing network of curious minds.
                  </p>
                  <div className="flex mt-4 space-x-4 justify-start">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-400"
                      onClick={() => window.open('https://github.com/Ommhaske713?tab=overview&from=2025-01-01&to=2025-12-31', '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="text-left ml-16">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                    <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
                    <li><Link href="/questions" className="hover:text-blue-400 transition-colors">Public Q&A and Messages</Link></li>
                    <li><Link href="/profile" className="hover:text-blue-400 transition-colors">Your Profile</Link></li>
                  </ul>
                </div>

                <div className="text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2 justify-start">
                      <MessageCircle className="h-4 w-4" /> help@Anonyexchange.io
                    </li>
                    <li className="flex items-center gap-2 justify-start">
                      <User className="h-4 w-4" /> Become a contributor
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-8 pt-6 text-center">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} AnonyExchange Community. Empowering conversations through questions.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:hidden py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:ml-28">
                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">AnonyExchange Community</h3>
                  <p className="text-slate-400 text-sm">
                    Share knowledge, receive thoughtful responses, and engage with a growing network of curious minds.
                  </p>
                  <div className="flex mt-4 space-x-4 justify-center md:justify-start">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full hover:bg-slate-800 text-slate-300 hover:text-slate-400"
                      onClick={() => window.open('https://github.com/Ommhaske713?tab=overview&from=2025-01-01&to=2025-12-31', '_blank')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </Button>
                  </div>
                </div>

                <div className="text-center md:text-left md:ml-16">
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li><Link href="/" className="hover:text-blue-400 transition-colors">Home</Link></li>
                    <li><Link href="/dashboard" className="hover:text-blue-400 transition-colors">Dashboard</Link></li>
                    <li><Link href="/questions" className="hover:text-blue-400 transition-colors">Public Q&A and Messages</Link></li>
                    <li><Link href="/profile" className="hover:text-blue-400 transition-colors">Your Profile</Link></li>
                  </ul>
                </div>

                <div className="text-center md:text-left">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact</h3>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-center gap-2 justify-center md:justify-start">
                      <MessageCircle className="h-4 w-4" /> help@Anonyexchange.io
                    </li>
                    <li className="flex items-center gap-2 justify-center md:justify-start">
                      <User className="h-4 w-4" /> Become a contributor
                    </li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-slate-800 mt-8 pt-6 text-center">
                <p className="text-slate-500 text-sm">
                  © {new Date().getFullYear()} AnonyExchange Community. Empowering conversations through questions.
                </p>
              </div>
            </div>
          </div>
          <div className="hidden lg:block h-64"></div> 
        </footer>
      </div>
    </>
  );
}

export default function QuestionsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white">Loading questions...</p>
        </div>
      </div>
    }>
      <QuestionsContent />
    </Suspense>
  );
}