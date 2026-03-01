import React, { RefObject } from "react";
import { ChatMessage } from "../types";

interface ChatProps {
  messages: ChatMessage[];
  input: string;
  onInputChange: (input: string) => void;
  onSend: () => void;
  chatEndRef: RefObject<HTMLDivElement>;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  input,
  onInputChange,
  onSend,
  chatEndRef,
}) => {
  return (
    <div className="bg-white/5 rounded-2xl p-4 flex flex-col" style={{ height: "320px" }}>
      <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
        Chat
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
          {messages.length}
        </span>
      </h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-2">
        {messages.length === 0 ? (
          <div className="text-white/40 text-sm text-center py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`p-2 rounded-lg ${msg.isSystem ? 'bg-green-500/10 border border-green-500/20' : 'bg-white/10'}`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-semibold text-sm ${msg.isSystem ? 'text-green-400' : 'text-pink-400'}`}>
                  {msg.username}
                </span>
                <span className="text-white/40 text-xs">{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className={`text-sm ${msg.isSystem ? 'text-green-300/80' : 'text-white'}`}>{msg.message}</p>
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && onSend()}
        />
        <button
          onClick={onSend}
          className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 px-3 py-2 rounded-lg transition-all"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default Chat;
