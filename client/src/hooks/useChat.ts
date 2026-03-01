import { useState, useCallback, useEffect, RefObject } from "react";
import { ChatMessage } from "../types";
import socketService from "../services/socket";

export interface UseChatReturn {
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (input: string) => void;
  sendChatMessage: (username: string, roomId: string) => void;
  chatEndRef: RefObject<HTMLDivElement>;
}

export function useChat(): UseChatReturn {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = { current: null } as RefObject<HTMLDivElement>;

  // Listen for chat messages
  useEffect(() => {
    const cleanup = socketService.onChatMessage((message) => {
      setChatMessages((prev) => [...prev, message]);
    });
    return () => cleanup();
  }, []);

  // Listen for user joined notifications
  useEffect(() => {
    const cleanup = socketService.onUserJoined((data) => {
      const notification: ChatMessage = {
        id: Date.now().toString() + "_join",
        username: "System",
        message: data.message,
        timestamp: new Date(),
        isSystem: true
      };
      setChatMessages((prev) => [...prev, notification]);
    });
    return () => cleanup();
  }, []);

  // Listen for user left notifications
  useEffect(() => {
    const cleanup = socketService.onUserLeft((data) => {
      const notification: ChatMessage = {
        id: Date.now().toString() + "_leave",
        username: "System",
        message: data.message,
        timestamp: new Date(),
        isSystem: true
      };
      setChatMessages((prev) => [...prev, notification]);
    });
    return () => cleanup();
  }, []);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated
    const timer = setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [chatMessages]);

  const sendChatMessage = useCallback((username: string, roomId: string) => {
    if (!chatInput.trim()) return;
    const message: ChatMessage = {
      id: Date.now().toString(),
      username,
      message: chatInput.trim(),
      timestamp: new Date()
    };
    socketService.sendChatMessage(roomId, message);
    setChatInput("");
  }, [chatInput]);

  return {
    chatMessages,
    chatInput,
    setChatInput,
    sendChatMessage,
    chatEndRef,
  };
}
