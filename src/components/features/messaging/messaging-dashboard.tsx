"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Clock,
  Check,
  CheckCheck,
  Archive,
  X,
  User,
  Smartphone,
  AtSign
} from "lucide-react";
import { toast } from "sonner";
import type { Conversation, IncomingMessage, OutgoingMessage } from '@/lib/messaging/message-router';

interface ConversationWithSummary extends Conversation {
  messageCount: number;
  lastMessage?: IncomingMessage | OutgoingMessage;
  unreadCount: number;
}

export function MessagingDashboard() {
  const [conversations, setConversations] = useState<ConversationWithSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
    // Set up polling for real-time updates
    const interval = setInterval(fetchConversations, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messaging/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversationDetails = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messaging/conversations?id=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation);
      }
    } catch (error) {
      console.error('Failed to fetch conversation details:', error);
      toast.error('Failed to load conversation');
    }
  };

  const sendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return;

    setSending(true);
    try {
      const response = await fetch('/api/messaging/send-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          replyContent: replyText.trim(),
        }),
      });

      if (response.ok) {
        setReplyText('');
        toast.success('Reply sent successfully!');
        // Refresh conversation details
        await fetchConversationDetails(selectedConversation.id);
        await fetchConversations();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateConversationStatus = async (conversationId: string, action: string) => {
    try {
      const response = await fetch('/api/messaging/conversations', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId,
          action,
        }),
      });

      if (response.ok) {
        toast.success(`Conversation ${action === 'close' ? 'closed' : 'archived'} successfully`);
        await fetchConversations();
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update conversation');
      }
    } catch (error) {
      console.error('Failed to update conversation:', error);
      toast.error('Failed to update conversation');
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'SMS':
        return <Phone className="h-4 w-4" />;
      case 'EMAIL':
        return <Mail className="h-4 w-4" />;
      case 'IN_APP':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChannelColor = (channel: string) => {
    switch (channel) {
      case 'SMS':
        return 'bg-green-100 text-green-800';
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800';
      case 'IN_APP':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCustomerIdentifier = (identifier: string, channel: string) => {
    if (channel === 'SMS') {
      const cleaned = identifier.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return `(${cleaned.substr(0, 3)}) ${cleaned.substr(3, 3)}-${cleaned.substr(6, 4)}`;
      }
    }
    return identifier;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="loading" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Customer Messages
          </CardTitle>
          <CardDescription>
            {conversations.length} active conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[700px] overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No customer messages yet</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                  onClick={() => fetchConversationDetails(conversation.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getChannelColor(conversation.channel)}>
                          {getChannelIcon(conversation.channel)}
                          <span className="ml-1">{conversation.channel}</span>
                        </Badge>
                        {conversation.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">
                        {formatCustomerIdentifier(conversation.customerIdentifier, conversation.channel)}
                      </p>
                      {conversation.lastMessage && (
                        <p className="text-xs text-gray-600 truncate mt-1">
                          {conversation.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.lastMessageAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {conversation.messageCount} messages
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conversation Details */}
      <Card className="lg:col-span-2">
        {!selectedConversation ? (
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a customer conversation from the list to view messages and reply
                </p>
              </div>
            </div>
          </CardContent>
        ) : (
          <>
            {/* Conversation Header */}
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {selectedConversation.channel === 'SMS' && <Smartphone className="h-5 w-5" />}
                  {selectedConversation.channel === 'EMAIL' && <AtSign className="h-5 w-5" />}
                  {selectedConversation.channel === 'IN_APP' && <User className="h-5 w-5" />}
                  {formatCustomerIdentifier(selectedConversation.customerIdentifier, selectedConversation.channel)}
                </CardTitle>
                <CardDescription>
                  {selectedConversation.channel} conversation • {selectedConversation.messages.length} messages
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateConversationStatus(selectedConversation.id, 'close')}
                  className="btn-primary"
                >
                  <X className="h-4 w-4 mr-1" />
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => updateConversationStatus(selectedConversation.id, 'archive')}
                  className="btn-primary"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            </CardHeader>

            {/* Messages */}
            <CardContent className="p-0 flex-1">
              <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                {selectedConversation.messages.map((message, index) => {
                  const isIncoming = 'from' in message && message.from !== 'tgs-default';
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isIncoming ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          isIncoming
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                          {!isIncoming && (
                            <Check className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Separator />

              {/* Reply Input */}
              <div className="p-4">
                <div className="flex gap-2">
                  <Textarea
                    placeholder={`Reply via ${selectedConversation.channel.toLowerCase()}...`}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 min-h-[60px] max-h-[120px]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        sendReply();
                      }
                    }}
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim() || sending}
                    className="btn-gradient-primary"
                  >
                    {sending ? (
                      <div className="loading w-4 h-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Ctrl+Enter to send • Reply will be sent via {selectedConversation.channel}
                </p>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}