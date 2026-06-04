import type { ChatMessage } from "../../types/chat.types";
import { User, Brain } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

const parseInlineStyles = (text: string, isUser: boolean) => {
  const regex = /(\*\*.*?\*\*|\*.*?\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong
          key={index}
          className={`font-semibold ${isUser ? "text-white font-bold" : "text-cyan-300 font-bold"}`}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em
          key={index}
          className={`italic ${isUser ? "text-slate-100" : "text-slate-300"}`}
        >
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
};

const renderFormattedContent = (content: string, isUser: boolean) => {
  if (!content) return null;

  const lines = content.split("\n");
  const result: React.ReactNode[] = [];
  
  interface LineInfo {
    type: "empty" | "nested-bullet" | "bullet" | "number" | "text";
    text: string;
    raw: string;
  }
  
  const parsedLines: LineInfo[] = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed === "") {
      return { type: "empty", text: "", raw: line };
    }
    
    // Check for nested bullet (starts with tab or at least 2 spaces, then bullet)
    if (/^(\t|\s{2,})([*+-])\s+(.*)$/.test(line)) {
      const match = line.match(/^(\t|\s{2,})([*+-])\s+(.*)$/);
      return { type: "nested-bullet", text: match ? match[3] : trimmed, raw: line };
    }
    
    // Check for top-level bullet
    if (/^([*+-])\s+(.*)$/.test(line)) {
      const match = line.match(/^([*+-])\s+(.*)$/);
      return { type: "bullet", text: match ? match[2] : trimmed, raw: line };
    }
    
    // Check for numbered list
    if (/^(\d+)\.\s+(.*)$/.test(line)) {
      const match = line.match(/^(\d+)\.\s+(.*)$/);
      return { type: "number", text: match ? match[2] : trimmed, raw: line };
    }
    
    return { type: "text", text: line, raw: line };
  });

  let i = 0;
  while (i < parsedLines.length) {
    const current = parsedLines[i];

    if (current.type === "empty") {
      if (i > 0 && parsedLines[i - 1].type !== "empty") {
        result.push(<div key={`spacer-${i}`} className="h-2" />);
      }
      i++;
      continue;
    }

    if (current.type === "number") {
      const items: React.ReactNode[] = [];
      while (i < parsedLines.length && (parsedLines[i].type === "number" || parsedLines[i].type === "nested-bullet")) {
        const item = parsedLines[i];
        if (item.type === "number") {
          items.push(
            <li key={`li-${i}`} className="pl-1">
              {parseInlineStyles(item.text, isUser)}
            </li>
          );
        } else if (item.type === "nested-bullet") {
          items.push(
            <ul key={`ul-nested-${i}`} className={`list-disc list-inside pl-4 mt-1 mb-1 space-y-1 ${isUser ? "marker:text-white/60 text-slate-100" : "marker:text-cyan-500/60 text-slate-300"}`}>
              <li className="list-[circle] inline-block w-full pl-2">
                {parseInlineStyles(item.text, isUser)}
              </li>
            </ul>
          );
        }
        i++;
      }
      result.push(
        <ol key={`ol-${i}`} className={`list-decimal list-inside pl-1 my-2 space-y-1.5 ${isUser ? "marker:text-white/80 text-white" : "marker:text-cyan-400 text-slate-200"}`}>
          {items}
        </ol>
      );
      continue;
    }

    if (current.type === "bullet") {
      const items: React.ReactNode[] = [];
      while (i < parsedLines.length && (parsedLines[i].type === "bullet" || parsedLines[i].type === "nested-bullet")) {
        const item = parsedLines[i];
        if (item.type === "bullet") {
          items.push(
            <li key={`li-${i}`} className="pl-1">
              {parseInlineStyles(item.text, isUser)}
            </li>
          );
        } else if (item.type === "nested-bullet") {
          items.push(
            <ul key={`ul-nested-${i}`} className={`list-disc list-inside pl-4 mt-1 mb-1 space-y-1 ${isUser ? "marker:text-white/60 text-slate-100" : "marker:text-cyan-500/60 text-slate-300"}`}>
              <li className="list-[circle] inline-block w-full pl-2">
                {parseInlineStyles(item.text, isUser)}
              </li>
            </ul>
          );
        }
        i++;
      }
      result.push(
        <ul key={`ul-${i}`} className={`list-disc list-inside pl-1 my-2 space-y-1.5 ${isUser ? "marker:text-white/80 text-white" : "marker:text-cyan-400 text-slate-200"}`}>
          {items}
        </ul>
      );
      continue;
    }

    if (current.type === "nested-bullet") {
      result.push(
        <ul key={`ul-standalone-${i}`} className={`list-disc list-inside pl-4 my-1 space-y-1 ${isUser ? "marker:text-white/60 text-white" : "marker:text-cyan-500/60 text-slate-300"}`}>
          <li className="list-[circle] inline-block w-full pl-2">
            {parseInlineStyles(current.text, isUser)}
          </li>
        </ul>
      );
      i++;
      continue;
    }

    result.push(
      <p key={`p-${i}`} className={`mb-2.5 last:mb-0 leading-relaxed ${isUser ? "text-white" : "text-slate-200"}`}>
        {parseInlineStyles(current.text, isUser)}
      </p>
    );
    i++;
  }

  return result;
};

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
          {renderFormattedContent(message.content, isUser)}
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
