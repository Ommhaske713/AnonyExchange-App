'use client'

import React from 'react';
import axios, { AxiosError } from 'axios';
import { X, Trash2 } from 'lucide-react';
import { Message } from '@/model/User';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';

type MessageCardProps = {
  message: Message;
  onMessageDelete: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();

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
        description:
          axiosError.response?.data.message ?? 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all duration-300">
      <CardHeader className="p-0 mb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-medium tracking-tight text-black leading-relaxed">
            {message.content}
          </CardTitle>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="opacity-0 group-hover:opacity-100 -mt-1 p-2 text-red-600 hover:text-red-600 hover:bg-red-100 transition-all duration-300"
              >
                <Trash2 className="h-5 w-5 " />
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
      </CardHeader>
      <CardContent className="p-0">
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
      </CardContent>
    </Card>
  );
}