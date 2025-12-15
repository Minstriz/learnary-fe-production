"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Conversation } from "@/type/chat.type";
import { Input } from "@/components/ui/input";
import { Search, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  currentUserId: string;
  onSelectConversation: (conversationId: string) => void;
}

const DEFAULT_AVATAR = "/images/temp/Profile-PNG-Photo.png"; 

export default function ConversationList({
  conversations,
  selectedConversationId,
  currentUserId,
  onSelectConversation,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;

    return conversations.filter((conv) => {
      const otherUser = conv.user1_id === currentUserId ? conv.user2 : conv.user1;
      return otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, currentUserId]);

  const getOtherUser = (conversation: Conversation) => {
    return conversation.user1_id === currentUserId ? conversation.user2 : conversation.user1;
  };

  const getLastMessage = (conversation: Conversation) => {
    if (conversation.messages && conversation.messages.length > 0) {
      return conversation.messages[0];
    }
    return null;
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "00:00";
    try {
      return formatDistanceToNow(new Date(dateString), { locale: vi, addSuffix: true });
    } catch {
      return "00:00";
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-white">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold mb-3">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
            <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
            <p className="text-center">
              {searchQuery ? "Không tìm thấy cuộc trò chuyện" : "Bạn chưa có đoạn hội thoại nào"}
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = getLastMessage(conversation);
            const isSelected = conversation.conversation_id === selectedConversationId;
            const isUnread = lastMessage && !lastMessage.is_read && lastMessage.sender_id !== currentUserId;

            return (
              <div
                key={conversation.conversation_id}
                onClick={() => onSelectConversation(conversation.conversation_id)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  isSelected ? "bg-blue-100 border-l-4 border-blue-500" : ""
                }`}>
                <div className="relative shrink-0">
                  <Image
                    src={otherUser.avatar || DEFAULT_AVATAR}
                    alt={otherUser.fullName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                  {isUnread && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-800 rounded-full border-2 border-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold truncate ${isUnread ? "text-black" : "text-gray-900"}`}>
                      {otherUser.fullName}
                    </h3>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">
                      {formatTime(lastMessage?.createdAt || conversation.last_message_at)}
                    </span>
                  </div>
                  <p
                    className={`text-sm truncate ${
                      isUnread ? "font-semibold text-gray-900" : "text-gray-600"
                    }`}
                  >
                    {lastMessage?.message_text || "Bắt đầu trò chuyện"}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
