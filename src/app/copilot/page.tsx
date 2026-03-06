"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Send,
    Bot,
    User,
    Sparkles,
    TrendingUp,
    PiggyBank,
    CreditCard,
    HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    {
        icon: TrendingUp,
        text: "Did I spend more on Uber this month than last?",
    },
    {
        icon: PiggyBank,
        text: "How can I save more money?",
    },
    {
        icon: CreditCard,
        text: "What are my biggest expenses?",
    },
    {
        icon: HelpCircle,
        text: "Show me my subscription costs",
    },
];

export default function CopilotPage() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Welcome to **Foresee AI Copilot**! 🚀\n\nI can help you understand your spending patterns, find savings opportunities, and answer any financial questions. I have access to your transaction history and can provide personalized insights.\n\nTry asking one of the suggested questions below, or type your own!",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (text?: string) => {
        const question = text || input.trim();
        if (!question || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: question,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch("/api/ai/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            const data = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        data.answer ||
                        "I couldn't process that request. Please try again.",
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content:
                        "Something went wrong. Please check your connection and try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const renderContent = (content: string) => {
        // Simple markdown-like rendering for bold
        const parts = content.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return (
                    <strong key={i} className="font-semibold text-mint">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            // Handle newlines
            return part.split("\n").map((line, j) => (
                <span key={`${i}-${j}`}>
                    {j > 0 && <br />}
                    {line}
                </span>
            ));
        });
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
            >
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint to-lime flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-background" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">AI Copilot</h1>
                        <p className="text-sm text-muted">
                            Ask anything about your finances
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                className={cn(
                                    "flex gap-4",
                                    msg.role === "user" ? "flex-row-reverse" : ""
                                )}
                            >
                                {/* Avatar */}
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                                        msg.role === "assistant"
                                            ? "bg-gradient-to-br from-mint/20 to-lime/10 text-mint"
                                            : "bg-card-hover text-foreground"
                                    )}
                                >
                                    {msg.role === "assistant" ? (
                                        <Bot className="w-5 h-5" />
                                    ) : (
                                        <User className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Message bubble */}
                                <div
                                    className={cn(
                                        "max-w-[600px] px-5 py-4 rounded-2xl text-sm leading-relaxed",
                                        msg.role === "assistant"
                                            ? "bg-background border border-border text-foreground rounded-tl-sm"
                                            : "bg-mint/10 border border-mint/20 text-foreground rounded-tr-sm"
                                    )}
                                >
                                    {renderContent(msg.content)}
                                    <p className="text-[10px] text-muted mt-2">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-4"
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint/20 to-lime/10 text-mint flex items-center justify-center flex-shrink-0">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-background border border-border px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-2">
                                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-mint" />
                                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-mint" />
                                <div className="typing-dot w-2.5 h-2.5 rounded-full bg-mint" />
                            </div>
                        </motion.div>
                    )}

                    {/* Suggested questions (show only at start) */}
                    {messages.length === 1 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4"
                        >
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q.text)}
                                    className="flex items-center gap-3 p-4 rounded-xl border border-border bg-background/50 hover:border-mint/30 hover:bg-card transition-all duration-200 text-left cursor-pointer group"
                                >
                                    <q.icon className="w-5 h-5 text-muted group-hover:text-mint transition-colors" />
                                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                        {q.text}
                                    </span>
                                </button>
                            ))}
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input Bar */}
                <div className="px-6 py-4 border-t border-border bg-card/50">
                    <div className="flex gap-3">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Ask about your finances..."
                            className="flex-1 bg-background border border-border rounded-xl px-5 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-mint/40 focus:ring-1 focus:ring-mint/20 transition-all"
                        />
                        <Button
                            onClick={() => sendMessage()}
                            variant="mint"
                            size="lg"
                            disabled={!input.trim() || isLoading}
                            className="rounded-xl px-6"
                        >
                            <Send className="w-4 h-4 mr-2" />
                            Send
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
