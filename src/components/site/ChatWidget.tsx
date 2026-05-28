import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "pw-chat-messages-v1";

function loadStored(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as UIMessage[]) : [];
  } catch {
    return [];
  }
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInitial(loadStored());
  }, []);

  if (initial === null) {
    // Show only the floating button until hydrated, so SSR/client match cleanly.
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-transform hover:scale-105"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return <ChatInner initial={initial} open={open} setOpen={setOpen} input={input} setInput={setInput} scrollRef={scrollRef} inputRef={inputRef} />;
}

function ChatInner({
  initial,
  open,
  setOpen,
  input,
  setInput,
  scrollRef,
  inputRef,
}: {
  initial: UIMessage[];
  open: boolean;
  setOpen: (v: boolean) => void;
  input: string;
  setInput: (v: string) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const { messages, sendMessage, status, error, setMessages } = useChat({
    id: "pinewood-support",
    messages: initial,
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Persist
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore quota */
    }
  }, [messages]);

  // Autoscroll
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, scrollRef]);

  // Focus input on open
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open, inputRef]);

  const busy = status === "submitted" || status === "streaming";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    sendMessage({ text });
  };

  const clearChat = () => {
    setMessages([]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* noop */ }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-elegant transition-transform hover:scale-105"
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-md shadow-elegant">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <p className="font-display text-base text-cream">Pinewood Concierge</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Usually replies instantly</p>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} className="text-[10px] uppercase tracking-wider text-muted-foreground hover:text-cream">
                Clear
              </button>
            )}
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="text-sm text-muted-foreground">
                Hello! Ask me about products, orders, shipping, or becoming a creator.
              </div>
            )}
            {messages.map((m) => {
              const text = m.parts
                .map((p) => (p.type === "text" ? p.text : ""))
                .join("");
              return (
                <div key={m.id} className={m.role === "user" ? "flex justify-end" : ""}>
                  {m.role === "user" ? (
                    <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
                      {text}
                    </div>
                  ) : (
                    <div className="max-w-[95%] whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {text || (busy ? <span className="text-muted-foreground">…</span> : null)}
                    </div>
                  )}
                </div>
              );
            })}
            {busy && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
              </div>
            )}
            {error && (
              <p className="text-xs text-destructive">Sorry — something went wrong. Please try again.</p>
            )}
          </div>

          <form onSubmit={submit} className="flex items-center gap-2 border-t border-border px-3 py-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-full border border-border bg-input px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-pine-glow focus:outline-none"
              disabled={busy}
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground disabled:opacity-50"
              aria-label="Send"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
