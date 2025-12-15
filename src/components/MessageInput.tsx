"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (text: string) => void;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export default function MessageInput({ onSendMessage, onTypingStart, onTypingStop}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTypingStart();
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 2000);

    if (!value.trim() && isTyping) {
      setIsTyping(false);
      onTypingStop();
    }
  };

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    onSendMessage(trimmedMessage);
    setMessage("");
    setIsTyping(false);
    onTypingStop();
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    
    // Reset sending flag sau 500ms
    setTimeout(() => setIsSending(false), 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
          className="min-h-11 max-h-[120px] resize-none"
          rows={1}/>
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          size="icon"
          className="shrink-0 h-11 w-11">
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
