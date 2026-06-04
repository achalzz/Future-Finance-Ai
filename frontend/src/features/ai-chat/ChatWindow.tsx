import { useEffect, useRef } from "react";
import type { ChatMessage } from "../../types/chat.types";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import { Bot, RefreshCw } from "lucide-react";

interface ChatWindowProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (content: string) => void;
  onResetChat?: () => void;
  suggestedActions?: string[];
  onActionClick?: (action: string) => void;
}

const ChatWindow = ({
  messages,
  isTyping,
  onSendMessage,
  onResetChat,
  suggestedActions = [],
  onActionClick,
}: ChatWindowProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages or typing state changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="glass rounded-3xl h-[600px] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
      {/* Chat Header */}
      <div className="h-16 px-6 bg-slate-900/80 border-b border-white/10 flex items-center justify-between backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Bot size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              AI Financial Assistant
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-medium">Ready to advise</p>
          </div>
        </div>

        {onResetChat && (
          <button
            onClick={onResetChat}
            className="p-2 text-slate-400 hover:text-cyan-400 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            title="Reset Conversation"
          >
            <RefreshCw size={16} />
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow overflow-y-auto p-6 space-y-5 bg-slate-950/20">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isTyping && (
          <div className="flex items-start gap-4 mr-auto max-w-[80%] animate-pulse">
            <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Bot size={16} />
            </div>
            <div className="bg-slate-800/80 border border-white/10 px-4 py-3 rounded-2xl rounded-tl-none text-slate-400 text-sm flex items-center gap-1.5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Action suggestions pills */}
      {!isTyping && suggestedActions.length > 0 && onActionClick && (
        <div className="px-6 py-2.5 flex flex-wrap gap-2 bg-slate-950/40 border-t border-white/5 overflow-x-auto shrink-0">
          {suggestedActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onActionClick(action)}
              className="bg-slate-900/80 hover:bg-cyan-500/10 border border-white/5 hover:border-cyan-500/20 px-3 py-1.5 rounded-full text-xs text-slate-350 hover:text-cyan-400 font-medium transition-all duration-200 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Input Footer */}
      <div className="p-4 bg-slate-900/60 border-t border-white/10 backdrop-blur-md z-10">
        <ChatInput onSendMessage={onSendMessage} disabled={isTyping} />
      </div>
    </div>
  );
};

export default ChatWindow;
