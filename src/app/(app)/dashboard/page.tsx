'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { 
  Loader2, 
  RefreshCcw, 
  Settings, 
  MessageCircle, 
  Copy, 
  Link as LinkIcon, 
  Inbox, 
  CheckCircle2,
  User,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { User as UserType } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AcceptMessageSchema } from '@/schema/acceptMessageSchema';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

const MESSAGES_PER_PAGE = 5;

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [currentPage, setCurrentPage] = useState(1);

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const answeredCount = messages.filter(msg => !!msg.reply).length;
  const pendingCount = messages.filter(msg => !msg.reply).length;

  const filteredMessages = React.useMemo(() => {
    let result = messages;

    if (activeTab === "answered") {
      result = result.filter(msg => !!msg.reply);
    } else if (activeTab === "pending") {
      result = result.filter(msg => !msg.reply);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(msg => 
        msg.content?.toLowerCase().includes(query) || 
        msg.reply?.toLowerCase().includes(query)
      );
    }
    
    return result;
  }, [messages, activeTab, searchQuery]);

  const sortedMessages = React.useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return sortOrder === 'newest' 
        ? dateB.getTime() - dateA.getTime()
        : dateA.getTime() - dateB.getTime();
    });
  }, [filteredMessages, sortOrder]);

  const totalPages = Math.ceil(sortedMessages.length / MESSAGES_PER_PAGE);
  const paginatedMessages = React.useMemo(() => {
    const startIndex = (currentPage - 1) * MESSAGES_PER_PAGE;
    return sortedMessages.slice(startIndex, startIndex + MESSAGES_PER_PAGE);
  }, [sortedMessages, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortOrder]);

  const handleReplyToggle = (messageId: string) => {
    setReplyingMessageId(currentId => {
      if (currentId === messageId) {
        return null;
      }
      return messageId;
    });
  };

  const handleMessageReply = async () => {
    await fetchMessages();
    setReplyingMessageId(null);
    toast({
      title: 'Reply Sent',
      description: 'Your message was successfully sent',
      className: 'bg-green-500 text-white',
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
    toast({
      title: 'Message Deleted',
      description: 'The message has been removed',
      variant: 'default',
    });
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-message');
      setValue('acceptMessages', response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      setMessages(response.data.messages || []);
      if (refresh) {
        toast({
          title: 'Messages Refreshed',
          description: 'Showing latest messages',
          className: 'bg-green-500 text-white',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    } finally {
      setIsLoading(false);
      setInitialLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session?.user) return;
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-message', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
        className: 'bg-green-500 text-white',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
        className: 'bg-red-500 text-white',
      });
    }
  };

  if (!session?.user) return null;

  const { username } = session.user as UserType;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(profileUrl).then(() => {
          toast({
            title: 'URL Copied!',
            description: 'Profile URL has been copied to clipboard.',
            className: 'bg-green-500 text-white',
          });
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = profileUrl;
        textArea.style.position = "fixed"; 
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
  
        try {
          const successful = document.execCommand('copy');
          if (successful) {
            toast({
              title: 'URL Copied!',
              description: 'Profile URL has been copied to clipboard.',
              className: 'bg-green-500 text-white',
            });
          } else {
            toast({
              title: 'Copy failed',
              description: 'Please copy the URL manually',
              variant: 'destructive',
            });
          }
        } catch (err) {
          toast({
            title: 'Copy failed',
            description: 'Please copy the URL manually',
            variant: 'destructive',
          });
        }
        
        document.body.removeChild(textArea);
      }
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Please copy the URL manually',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-6 pb-8 px-3 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-4 mt-2 md:space-y-6 md:mt-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-lg p-4 md:p-8 border border-white/10 transition-all duration-300 hover:border-white/20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 md:gap-4 mb-1 md:mb-3">
              <div className="h-8 w-8 md:h-12 md:w-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 md:h-6 md:w-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl md:text-4xl font-bold text-white">
                  Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{username}</span>
                </h1>
              </div>
            </div>
            <p className="text-slate-300 text-xs md:text-base ml-10 md:ml-16">Manage your messages and interactions</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-3 gap-2 md:gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3 md:p-6 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-blue-500/30 to-blue-600/20 rounded-lg md:rounded-xl">
                <MessageCircle className="h-4 w-4 md:h-6 md:w-6 text-blue-400" />
              </div>
              <div className="mt-2 md:mt-0 text-center md:text-left">
                <h3 className="text-xs font-medium text-slate-400">Total</h3>
                <p className="text-lg md:text-2xl font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3 md:p-6 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg md:rounded-xl">
                <CheckCircle2 className="h-4 w-4 md:h-6 md:w-6 text-green-400" />
              </div>
              <div className="mt-2 md:mt-0 text-center md:text-left">
                <h3 className="text-xs font-medium text-slate-400">Done</h3>
                <p className="text-lg md:text-2xl font-bold text-white">{answeredCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl rounded-lg p-3 md:p-6 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
            <div className="flex flex-col items-center md:items-start md:flex-row md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-amber-500/30 to-amber-600/20 rounded-lg md:rounded-xl">
                <Inbox className="h-4 w-4 md:h-6 md:w-6 text-amber-400" />
              </div>
              <div className="mt-2 md:mt-0 text-center md:text-left">
                <h3 className="text-xs font-medium text-slate-400">Pending</h3>
                <p className="text-lg md:text-2xl font-bold text-white">{pendingCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 md:p-6 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
          <div className="flex items-center justify-between mb-2 md:mb-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-400" />
              <h3 className="text-sm md:font-medium text-white">Share Profile</h3>
            </div>
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs hidden md:inline-flex" style={{margin: "-5px -9px -3px 1px"}}>
              Your public link
            </Badge>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-2">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="w-full flex-1 px-3 md:px-4 py-2 md:py-3 bg-black/20 rounded-lg md:rounded-xl border border-white/10 text-slate-300 font-mono text-xs md:text-sm mb-2 md:mb-0"
            />
            <Button
              onClick={copyToClipboard}
              className="w-full md:w-auto px-4 py-2 md:py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg md:rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md shadow-purple-500/20"
            >
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-lg p-4 md:p-6 border border-white/10 transition-all duration-300 hover:bg-white/8 hover:border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="p-2 md:p-3 bg-gradient-to-br from-green-500/30 to-green-600/20 rounded-lg md:rounded-xl">
                <Settings className="h-4 w-4 md:h-6 md:w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-medium text-white">Message Settings</h3>
                <p className="text-xs md:text-sm text-slate-400">Control incoming messages</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
                className="data-[state=checked]:bg-green-500 scale-75 md:scale-100"
              />
              <span className="text-xs md:text-sm font-medium text-slate-300">
                {acceptMessages ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/5 backdrop-blur-xl rounded-lg p-3 md:p-6 border border-white/10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-3 md:mb-6">
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-white">Your Messages</h2>
              <p className="text-xs md:text-base text-slate-400">
                {filteredMessages.length} message{filteredMessages.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <Button
              onClick={() => fetchMessages(true)}
              className="mt-2 md:mt-0 px-3 py-1.5 md:py-3 bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2 transition-all text-sm md:text-base shadow-md hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCcw className="h-3 w-3 md:h-4 md:w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-2 md:items-center mb-3 md:mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white">
                  <SlidersHorizontal className="h-4 w-4 mr-1.5" />
                  Sort: {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                <DropdownMenuItem 
                  onClick={() => setSortOrder('newest')}
                  className={cn("text-white", sortOrder === 'newest' && "bg-blue-500/30")}
                >
                  Newest first
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setSortOrder('oldest')}
                  className={cn("text-white", sortOrder === 'oldest' && "bg-blue-500/30")}
                >
                  Oldest first
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-3 md:mb-6 bg-slate-800/50 p-0.5 md:p-1 rounded-lg border border-white/5">
              <TabsTrigger 
                value="all" 
                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/20 data-[state=active]:to-indigo-500/20 data-[state=active]:shadow-md data-[state=active]:shadow-blue-500/10 data-[state=inactive]:bg-transparent text-white rounded-md transition-all duration-300 py-1 md:py-1.5"
              >
                <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />
                <span>All</span>
                <Badge className="ml-1 md:ml-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:text-white text-xs scale-75 md:scale-100 px-1.5">{messages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="answered" 
                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500/20 data-[state=active]:to-emerald-500/20 data-[state=active]:shadow-md data-[state=active]:shadow-green-500/10 data-[state=inactive]:bg-transparent text-white rounded-md transition-all duration-300 py-1 md:py-1.5"
              >
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />
                <span>Done</span>
                <Badge className="ml-1 md:ml-2 bg-green-500/20 text-green-300 border border-green-500/30 hover:text-white text-xs scale-75 md:scale-100 px-1.5 data-[stae=active]:text-white">{answeredCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="text-xs md:text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500/20 data-[state=active]:to-orange-400/20 data-[state=active]:shadow-md data-[state=active]:shadow-amber-500/10 data-[state=inactive]:bg-transparent text-white rounded-md transition-all duration-300 data-[state=inactive]:text-white py-1 md:py-1.5"
              >
                <Inbox className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-1.5" />
                <span>New</span>
                <Badge className="ml-1 md:ml-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:text-white text-xs scale-75 md:scale-100 px-1.5">{pendingCount}</Badge>
              </TabsTrigger>
            </TabsList>

            {initialLoading ? (
              <div className="space-y-3 md:space-y-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="p-4 border border-gray-700 bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-2 mb-3">
                      <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24 bg-slate-700" />
                        <Skeleton className="h-3 w-16 bg-slate-700" />
                      </div>
                    </div>
                    <Skeleton className="h-16 w-full bg-slate-700 mb-3" />
                    <div className="flex justify-end">
                      <Skeleton className="h-8 w-20 bg-slate-700" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <TabsContent value="all" className="mt-0">
                  {renderMessageList(paginatedMessages)}
                </TabsContent>
                
                <TabsContent value="answered" className="mt-0">
                  {renderMessageList(paginatedMessages)}
                </TabsContent>
                
                <TabsContent value="pending" className="mt-0">
                  {renderMessageList(paginatedMessages)}
                </TabsContent>
              </>
            )}

            {!initialLoading && filteredMessages.length > MESSAGES_PER_PAGE && (
              <div className="flex items-center justify-between mt-4 md:mt-6">
                <Button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  variant="outline"
                  className="bg-slate-800/50 border-slate-700 text-white"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <div className="text-sm text-slate-300">
                  Page {currentPage} of {totalPages}
                </div>
                <Button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  variant="outline" 
                  className="bg-slate-800/50 border-slate-700 text-white"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </Tabs>
        </motion.div>
      </div>
    </div>
  );

  function renderMessageList(messages: Message[]) {
    if (messages.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center p-4 md:p-8 text-center bg-gray-900/50 rounded-lg"
        >
          <h3 className="text-base md:text-xl font-semibold text-gray-300 mb-1 md:mb-2">
            {searchQuery ? (
              "No matching messages found"
            ) : activeTab === "all" ? (
              "No messages yet"
            ) : activeTab === "answered" ? (
              "No answered messages"
            ) : (
              "No pending messages"
            )}
          </h3>
          <p className="text-xs md:text-base text-gray-400">
            {searchQuery ? (
              "Try adjusting your search query"
            ) : activeTab === "all" ? (
              "Share your profile link to start receiving messages"
            ) : activeTab === "answered" ? (
              "Reply to messages to see them here"
            ) : (
              "All messages have been answered"
            )}
          </p>
        </motion.div>
      );
    }
  
    return (
      <div className="grid grid-cols-1 gap-3 md:gap-6">
        {messages.map((message) => (
          <motion.div
            key={message._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "p-2 md:p-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200",
              replyingMessageId === message._id 
                ? "border-2 border-indigo-500 shadow-lg shadow-indigo-500/20" 
                : message.reply
                  ? "bg-gradient-to-br from-slate-800/80 to-indigo-900/30 border border-indigo-500/30"
                  : "bg-gradient-to-br from-slate-800/80 to-indigo-900/30 border border-indigo-500/30",
              replyingMessageId !== null && replyingMessageId !== message._id && "opacity-50"
            )}
          >
            <div className={cn(
              "absolute top-0 left-0 h-0 w-full",
              message.reply 
                ? "bg-gradient-to-r from-blue-500 to-indigo-600" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600"
            )} />
            
            <MessageCard
              message={message}
              onMessageDelete={handleDeleteMessage}
              isReplying={replyingMessageId === message._id}
              onReplyToggle={() => handleReplyToggle(message._id)}
              onMessageReply={handleMessageReply}
            />
          </motion.div>
        ))}
      </div>
    );
  }
}

export default UserDashboard;