'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Message } from '@/model/User';
import { MessageCard } from './MessageCard';
import { useToast } from '@/hooks/use-toast';

export function MessagesContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [replyingMessageId, setReplyingMessageId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get('/api/messages');
      setMessages(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const handleReplyToggle = (messageId: string) => {
    setReplyingMessageId(prevId => prevId === messageId ? null : messageId);
  };

  const handleMessageDelete = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.filter(message => message._id !== messageId)
    );
  };

  const handleMessageReply = () => {
    fetchMessages(); // Refresh messages after reply
    setReplyingMessageId(null); // Close reply section
  };

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageCard
          key={message._id}
          message={message}
          isReplying={replyingMessageId === message._id}
          onReplyToggle={() => handleReplyToggle(message._id)}
          onMessageDelete={handleMessageDelete}
          onMessageReply={handleMessageReply}
        />
      ))}
    </div>
  );
}