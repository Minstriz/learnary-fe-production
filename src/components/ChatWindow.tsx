"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Message, UserInfo } from "@/type/chat.type";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { MessageCircle } from "lucide-react";
import MessageInput from "./MessageInput";

interface ChatWindowProps {
  messages: Message[];
  currentUserId: string;
  otherUser: UserInfo | null;
  conversationId: string | null;
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

const DEFAULT_AVATAR = "/images/temp/Profile-PNG-Photo.png";

export default function ChatWindow({
  messages,
  currentUserId,
  otherUser,
  conversationId,
  isTyping,
  onSendMessage,
  onTypingStart,
  onTypingStop,
}: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
  /*     messagesEndRef.current.scrollIntoView({ behavior: "auto" }); */
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      
      if (isToday) {
        return format(date, "HH:mm", { locale: vi });
      } else {
        return format(date, "dd/MM/yyyy HH:mm", { locale: vi });
      }
    } catch {
      return "";
    }
  };

  if (!conversationId || !otherUser) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50">
        <MessageCircle className="h-24 w-24 text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-3 p-4 border-b bg-white shadow-sm">
        <Image
          src={otherUser.avatar || DEFAULT_AVATAR}
          alt={otherUser.fullName}
          width={40}
          height={40}
          className="rounded-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = DEFAULT_AVATAR;
          }}
        />
        <div>
          <h3 className="font-semibold text-gray-900">{otherUser.fullName}</h3>
          {isTyping && (
            <p className="text-sm text-blue-500 italic">Đang gõ...</p>
          )}
        </div>
      </div>

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageCircle className="h-16 w-16 text-gray-300 mb-2" />
            <p className="text-gray-500">Bắt đầu nhắn tin ngay</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSender = message.sender_id === currentUserId;
            return (
              <div  key={message.message_id}  className={`flex items-end gap-2 ${isSender ? "flex-row-reverse" : "flex-row"}`}>
                {!isSender && (
                  <Image
                    src={message.sender.avatar || DEFAULT_AVATAR}
                    alt={message.sender.fullName}
                    width={32}
                    height={32}
                    className="rounded-full object-cover shrink-0"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = DEFAULT_AVATAR;
                    }}
                  />
                )}
                
                <div className={`flex flex-col ${isSender ? "items-end" : "items-start"} max-w-[70%]`}>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isSender
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-900 rounded-bl-none"
                    }`}>
                    <p className="whitespace-pre-wrap wrap-break-word">{message.message_text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 px-2">
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        onSendMessage={onSendMessage}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
}
