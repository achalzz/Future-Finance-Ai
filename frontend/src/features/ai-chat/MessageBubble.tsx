import type { ChatMessage } from "../../types/chat.types";
import { User, Brain } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex items-start gap-4 max-w-[85%] ${
        isUser ? "ml-auto flex-row-reverse" : "mr-auto"
      } transition-all duration-300`}
    >
      {/* Avatar Container */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center border shrink-0 shadow-sm ${
          isUser
            ? "bg-slate-900 border-white/10 text-cyan-400"
            : "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
        }`}
      >
        {isUser ? <User size={16} /> : <Brain size={16} />}
      </div>

      {/* Bubble Content */}
      <div className="space-y-1">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-md ${
            isUser
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none"
              : "bg-slate-800/80 border border-white/10 text-slate-150 rounded-tl-none backdrop-blur-md"
          }`}
        >
          {message.content}
        </div>
        <div
          className={`text-[10px] text-slate-500 font-medium px-1 ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
