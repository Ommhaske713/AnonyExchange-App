'use client';

import { MessageCard } from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Message } from '@/model/User';
import { ApiResponse } from '@/types/ApiResponse';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw, Settings, MessageCircle, Copy, Link as LinkIcon, Inbox, CheckCircle2 } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AcceptMessageSchema } from '@/schema/acceptMessageSchema';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const { toast } = useToast();
  const { data: session } = useSession();
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const answeredCount = messages.filter(msg => !!msg.reply).length;
  const pendingCount = messages.filter(msg => !msg.reply).length;

  const filteredMessages = React.useMemo(() => {
    if (activeTab === "answered") {
      return messages.filter(msg => !!msg.reply);
    } else if (activeTab === "pending") {
      return messages.filter(msg => !msg.reply);
    }
    return messages;
  }, [messages, activeTab]);

  const sortedMessages = React.useMemo(() => {
    return [...filteredMessages].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [filteredMessages]);

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

  const { username } = session.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
      className: 'bg-green-500 text-white',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-12 px-4">
      <div className="max-w-7xl mx-auto space-y-6 mt-8">
        <div className="relative overflow-hidden bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">{username}</span> 👋
          </h1>
          <p className="text-slate-300">Manage your feedback and interactions in one place</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <MessageCircle className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-400">Total Messages</h3>
                <p className="text-2xl font-bold text-white">{messages.length}</p>
              </div>
            </div>
          </div>

          <div className="col-span-2 bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-5 w-5 text-purple-400" />
                <h3 className="font-medium text-white">Share Profile</h3>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Your public link
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={profileUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-black/20 rounded-xl border border-white/10 text-slate-300 font-mono text-sm"
              />
              <Button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center gap-2 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Settings className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Message Settings</h3>
                <p className="text-sm text-slate-400">Control incoming messages</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                {...register('acceptMessages')}
                checked={acceptMessages}
                onCheckedChange={handleSwitchChange}
                disabled={isSwitchLoading}
                className="data-[state=checked]:bg-green-500"
              />
              <span className="text-sm font-medium text-slate-300">
                {acceptMessages ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-xl p-6 border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Your Messages</h2>
              <p className="text-slate-400">
                {messages.length} message{messages.length !== 1 ? 's' : ''} received
              </p>
            </div>
            <Button
              onClick={() => fetchMessages(true)}
              className="px-4 py-2 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center gap-2 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-6 bg-slate-800/50 p-1 rounded-lg">
              <TabsTrigger 
                value="all" 
                className="data-[state=inactive]:bg-slate-700 text-white rounded-md"
              >
                All Messages
                <Badge className="ml-2 bg-blue-500/20 text-blue-500">{messages.length}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="answered" 
                className="data-[state=inactive]:bg-slate-700 rounded-md"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Answered
                <Badge className="ml-2 bg-green-500/20 text-green-500">{answeredCount}</Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="pending" 
                className="data-[state=inactive]:bg-slate-700 rounded-md"
              >
                <Inbox className="h-4 w-4 mr-1" />
                Pending
                <Badge className="ml-2 bg-amber-500/20 text-amber-400">{pendingCount}</Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              {renderMessageList(sortedMessages)}
            </TabsContent>
            
            <TabsContent value="answered" className="mt-0">
              {renderMessageList(sortedMessages)}
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              {renderMessageList(sortedMessages)}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );

  function renderMessageList(messages: Message[]) {
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-900 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-300 mb-2">
            {activeTab === "all"
              ? "No messages yet"
              : activeTab === "answered"
                ? "No answered messages yet"
                : "No pending messages yet"
            }
          </h3>
          <p className="text-gray-400">
            {activeTab === "all"
              ? "Share your profile link to start receiving messages"
              : activeTab === "answered"
                ? "Reply to messages to see them here"
                : "All messages have been answered"
            }
          </p>
        </div>
      );
    }
  
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {messages.map((message) => (
            <div 
              key={message._id} 
              className={cn(
                "p-4 border border-gray-700 bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200",
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
            </div>
          ))}
        </div>
      );
  }
}

export default UserDashboard;