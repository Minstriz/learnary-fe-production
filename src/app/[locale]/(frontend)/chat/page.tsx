"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/app/context/AuthContext";
import api from "@/app/lib/axios";
import { initSocket, joinConversation, leaveConversation, emitTypingStart, emitTypingStop } from "@/app/lib/socket";
import { Conversation, Message, UserInfo, TypingStatus } from "@/type/chat.type";
import ConversationList from "@/components/ConversationList";
import ChatWindow from "@/components/ChatWindow";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function ChatPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, boolean>>(new Map());
  const [showMobileChat, setShowMobileChat] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get("/conversations");
      const rawData = response.data.data || [];
      
      const data = rawData.map((conv: Conversation) => ({
        ...conv,
        conversation_id: conv.conversation_id?.trim(),
        user1_id: conv.user1_id?.trim(),
        user2_id: conv.user2_id?.trim(),
      }));
      
      setConversations(data);
      const conversationIdFromUrl = searchParams.get('conversation');
      if (!conversationIdFromUrl && data.length > 0 && !selectedConversationId) {
        const firstConvId = data[0].conversation_id;
        setSelectedConversationId(firstConvId);
        router.replace(`/chat?conversation=${firstConvId}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Không thể tải danh sách hội thoại");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams, selectedConversationId, router]);
  useEffect(() => {
    if (!token || !user) return;
    const socket = initSocket(token);
    socket.on("message:new", (msg: Message) => {
      const newMessage = {
        ...msg,
        message_id: msg.message_id?.trim(),
        sender_id: msg.sender_id?.trim(),
        receiver_id: msg.receiver_id?.trim(),
        conversation_id: msg.conversation_id?.trim(),
      };
      
      setMessages((prev) => {
        const exists = prev.some(m => m.message_id === newMessage.message_id);
        if (exists) {
          return prev;
        }
        return [...prev, newMessage];
      });

      setConversations((prev) => {
        const updated = prev.map((conv) => {
          const matches = conv.conversation_id === newMessage.conversation_id;
          return matches
            ? {
                ...conv,
                last_message_at: newMessage.createdAt,
                messages: [{ 
                  message_text: newMessage.message_text, 
                  createdAt: newMessage.createdAt, 
                  is_read: newMessage.is_read,
                  sender_id: newMessage.sender_id 
                }],
              }
            : conv;
        });
        return updated;
      });
    });

    socket.on("message:received", (msg: Message) => {
      const newMessage = {
        ...msg,
        message_id: msg.message_id?.trim(),
        sender_id: msg.sender_id?.trim(),
        receiver_id: msg.receiver_id?.trim(),
        conversation_id: msg.conversation_id?.trim(),
      };
      
      if (selectedConversationId === newMessage.conversation_id) {
        setMessages((prev) => {
          const exists = prev.some(m => m.message_id === newMessage.message_id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        markConversationAsRead(newMessage.conversation_id);
      }
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === newMessage.conversation_id
            ? {
                ...conv,
                last_message_at: newMessage.createdAt,
                messages: [{ 
                  message_text: newMessage.message_text, 
                  createdAt: newMessage.createdAt, 
                  is_read: false,
                  sender_id: newMessage.sender_id 
                }],
              }
            : conv
        )
      );
    });

    socket.on("user:typing", (data: TypingStatus) => {
      setTypingUsers((prev) => new Map(prev).set(data.conversationId, true));
    });

    socket.on("user:stopped_typing", (data: TypingStatus) => {
      setTypingUsers((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.conversationId);
        return newMap;
      });
    });

    socket.on("conversation:created", () => {
      fetchConversations();
    });

    socket.on("conversation:deleted", (data: { conversationId: string }) => {
      setConversations((prev) => prev.filter((c) => c.conversation_id !== data.conversationId));
      if (selectedConversationId === data.conversationId) {
        setSelectedConversationId(null);
        setMessages([]);
      }
    });

    return () => {
      socket.off("message:new");
      socket.off("message:received");
      socket.off("user:typing");
      socket.off("user:stopped_typing");
      socket.off("conversation:created");
      socket.off("conversation:deleted");
    };
  }, [token, user, selectedConversationId, fetchConversations]);

  

  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoadingMessages(true);
    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
      const cleanMessages = (response.data.data || []).map((msg: Message) => ({
        ...msg,
        message_id: msg.message_id?.trim(),
        conversation_id: msg.conversation_id?.trim(),
        sender_id: msg.sender_id?.trim(),
        receiver_id: msg.receiver_id?.trim(),
        message_text: msg.message_text,
        sender: {
          ...msg.sender,
          user_id: msg.sender?.user_id?.trim(),
          fullName: msg.sender?.fullName?.trim(),
          avatar: msg.sender?.avatar?.trim()
        },
        receiver: {
          ...msg.receiver,
          user_id: msg.receiver?.user_id?.trim(),
          fullName: msg.receiver?.fullName?.trim(),
          avatar: msg.receiver?.avatar?.trim()
        }
      }));
      
      setMessages(cleanMessages);
      
      await markConversationAsRead(conversationId);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  const markConversationAsRead = async (conversationId: string) => {
    try {
      await api.put(`/conversations/${conversationId}/read-all`);
      
      setConversations((prev) =>
        prev.map((conv) =>
          conv.conversation_id === conversationId && conv.messages
            ? {
                ...conv,
                messages: conv.messages.map(msg => ({ ...msg, is_read: true }))
              }
            : conv
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };


  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (selectedConversationId) {
        leaveConversation(selectedConversationId);
      }
      setSelectedConversationId(conversationId);
      setMessages([]);
      setShowMobileChat(true);
      
      router.replace(`/chat?conversation=${conversationId}`, { scroll: false });
      joinConversation(conversationId);
      fetchMessages(conversationId);
    },
    [selectedConversationId, fetchMessages, router]
  );

  const handleSendMessage = async (text: string) => {
    if (!selectedConversationId || !text.trim()) return;

    try {
      const response = await api.post(`/conversations/${selectedConversationId}/messages`, {
        message_text: text,
      });
      if (response.data.data) {
        const msg = response.data.data;
        const newMessage = {
          ...msg,
          message_id: msg.message_id?.trim(),
          sender_id: msg.sender_id?.trim(),
          receiver_id: msg.receiver_id?.trim(),
          conversation_id: msg.conversation_id?.trim(),
        };
        setMessages((prev) => {
          const exists = prev.some(m => m.message_id === newMessage.message_id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
        setConversations((prev) =>
          prev.map((conv) =>
            conv.conversation_id === newMessage.conversation_id
              ? {
                  ...conv,
                  last_message_at: newMessage.createdAt,
                  messages: [{ 
                    message_text: newMessage.message_text, 
                    createdAt: newMessage.createdAt, 
                    is_read: newMessage.is_read,
                    sender_id: newMessage.sender_id
                  }],
                }
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Không thể gửi tin nhắn");
    }
  };

  const handleTypingStart = () => {
    if (selectedConversationId) {
      emitTypingStart(selectedConversationId);
    }
  };

  const handleTypingStop = () => {
    if (selectedConversationId) {
      emitTypingStop(selectedConversationId);
    }
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [fetchConversations, user]);

  useEffect(() => {
    const conversationIdFromUrl = searchParams.get('conversation');
    if (conversationIdFromUrl && conversations.length > 0) {
      const conversationExists = conversations.some(
        (conv) => conv.conversation_id === conversationIdFromUrl
      );
      
      if (conversationExists && conversationIdFromUrl !== selectedConversationId) {
        if (selectedConversationId) {
          leaveConversation(selectedConversationId);
        }
        setSelectedConversationId(conversationIdFromUrl);
        setMessages([]);
        joinConversation(conversationIdFromUrl);
        fetchMessages(conversationIdFromUrl);
      }
    }
  }, [searchParams, conversations, selectedConversationId, fetchMessages]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
          <p className="text-gray-600">Bạn cần đăng nhập để sử dụng tính năng chat</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  const selectedConversation = conversations.find((c) => c.conversation_id === selectedConversationId);
  const otherUser: UserInfo | null = selectedConversation
    ? selectedConversation.user1_id === user.id
      ? selectedConversation.user2
      : selectedConversation.user1
    : null;

  const isTyping = selectedConversationId ? typingUsers.get(selectedConversationId) || false : false;

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      <div className="hidden md:flex w-full">
        <div className="w-1/3 min-w-[300px] max-w-[400px]">
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            currentUserId={user.id}
            onSelectConversation={handleSelectConversation}
          />
        </div>

        <div className="flex-1">
          {isLoadingMessages ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <ChatWindow
              messages={messages}
              currentUserId={user.id}
              otherUser={otherUser}
              conversationId={selectedConversationId}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          )}
        </div>
      </div>

      <div className="md:hidden w-full flex flex-col">
        {!showMobileChat ? (
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId}
            currentUserId={user.id}
            onSelectConversation={handleSelectConversation}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-2 bg-white border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileChat(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </div>
            {isLoadingMessages ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <ChatWindow
                messages={messages}
                currentUserId={user.id}
                otherUser={otherUser}
                conversationId={selectedConversationId}
                isTyping={isTyping}
                onSendMessage={handleSendMessage}
                onTypingStart={handleTypingStart}
                onTypingStop={handleTypingStop}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
