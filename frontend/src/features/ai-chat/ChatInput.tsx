import React, { useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSendMessage, disabled }: ChatInputProps) => {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    onSendMessage(text.trim());
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <div className="relative w-full flex items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          placeholder="Ask anything (e.g., How much should I save?)..."
          className="w-full bg-slate-950/60 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all placeholder:text-slate-600 disabled:opacity-50"
        />

        {/* Premium Integrated Send Button */}
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className="absolute right-2 top-2 bottom-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/10 active:scale-[0.96] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          title="Send Message"
        >
          <Send size={16} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;
