'use client'
import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Trash2, Reply, X } from 'lucide-react';
import { Message } from '@/model/User';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';

type MessageCardProps = {
  message: Message & {
    reply?: string;
    repliedAt?: Date;
  };
  isReplying: boolean;
  onReplyToggle: () => void;
  onMessageDelete: (messageId: string) => void;
  onMessageReply: () => void;
};

export function MessageCard({ message, isReplying, onReplyToggle, onMessageDelete, onMessageReply }: MessageCardProps) {
  const { toast } = useToast();
  const [reply, setReply] = useState(message.reply || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete(message._id);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  const handleReply = async () => {
    if (!reply.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await axios.post(`/api/reply-message/${message._id}`, {
        reply: reply.trim()
      });

      toast({
        title: 'Success!',
        description: response.data.message,
      });

      setReply(''); 
      onMessageReply(); 
    } catch (error) {
      const axiosError = error as AxiosError;
      toast({
        title: 'Error',
        description: 'Failed to send reply',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card
      className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
    >
      <CardHeader className="p-0 mb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-medium tracking-tight text-white leading-relaxed">
              {message.content}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm text-slate-400">
                {new Date(message.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2" onClick={stopPropagation}>
            {!isReplying && !message.reply && (
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onReplyToggle();
                }}
                className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto rounded-full sm:rounded-md text-blue-600 hover:text-blue-700 hover:bg-blue-200 bg-blue-50 sm:bg-transparent transition-all duration-500"
              >
                <Reply className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-100 md:opacity-0 group-hover:opacity-100 p-1 sm:p-2 h-10 w-10 sm:h-auto sm:w-auto rounded-full sm:rounded-md text-red-600 hover:text-red-700 bg-red-50 sm:bg-transparent hover:bg-red-50 transition-all duration-300"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white/10 backdrop-blur-lg border border-white/10">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Message</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-300">
                    This action cannot be undone. This message will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/5 text-white hover:bg-white/10 border-white/10">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteConfirm}
                    className="bg-red-500 hover:bg-red-600 text-white border-0"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {message.reply ? (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-blue-600">Reply</p>
                <span className="text-xs text-slate-500">
                  {message.repliedAt && new Date(message.repliedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-black mt-2">{message.reply}</p>
            </div>
          </div>
        ) : isReplying ? (
          <div className="mt-4 border-t border-white/10 pt-4" onClick={stopPropagation}>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-slate-600">Write a reply</p>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReplyToggle();
                  }}
                  className="h-6 w-6 p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type your reply here..."
                className="bg-white border-slate-200 text-black min-h-[100px] mb-3"
                onClick={stopPropagation}
              />
              <div className="flex justify-end">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReply();
                  }}
                  disabled={isSubmitting}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {isSubmitting ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}