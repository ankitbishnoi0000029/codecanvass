"use client";

import { useState, useRef, useEffect } from "react";

const SUGGESTIONS = [
  "Build a responsive landing page",
  "Create a login form with validation",
  "Make an animated todo app",
  "Design a pricing table component",
  "Build a dark mode dashboard",
];

function AutoResizeTextarea({
  value,
  onChange,
  onSubmit,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = Math.min(ref.current.scrollHeight, 200) + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (value.trim()) onSubmit();
        }
      }}
      placeholder={placeholder}
      rows={1}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        resize: "none",
        color: "#ececec",
        fontSize: "16px",
        fontFamily: "'Söhne', ui-sans-serif, system-ui, -apple-system, sans-serif",
        lineHeight: "1.6",
        padding: "0",
        maxHeight: "200px",
        overflowY: "auto",
      }}
    />
  );
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }}
      title="Copy code"
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: done ? "#4ade80" : "#8e8ea0",
        padding: "4px 6px", borderRadius: "6px",
        display: "flex", alignItems: "center", gap: "5px",
        fontSize: "12px", transition: "color 0.2s",
      }}
      onMouseEnter={e => { if (!done) (e.currentTarget as HTMLButtonElement).style.color = "#ececec"; }}
      onMouseLeave={e => { if (!done) (e.currentTarget as HTMLButtonElement).style.color = "#8e8ea0"; }}
    >
      {done ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      )}
      {done ? "Copied!" : "Copy code"}
    </button>
  );
}

type Message = {
  role: "user" | "assistant";
  content: string;
  code?: string;
  preview?: string;
  tab?: "code" | "preview";
};

function extractCode(text: string): { code: string; preview: string } {
  const htmlMatch = text.match(/```html([\s\S]*?)```/i);
  if (htmlMatch) return { code: text, preview: htmlMatch[1].trim() };
  const anyMatch = text.match(/```[\w]*\n?([\s\S]*?)```/);
  if (anyMatch) return { code: text, preview: "" };
  return { code: text, preview: "" };
}

function AssistantMessage({ msg, onTabChange }: { msg: Message; onTabChange: (tab: "code" | "preview") => void }) {
  const activeTab = msg.tab || "code";
  const hasPreview = !!msg.preview;

  // Render plain text parts and code blocks
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, i) => {
      if (part.startsWith("```")) {
        const lang = part.match(/```(\w*)/)?.[1] || "";
        const code = part.replace(/```\w*\n?/, "").replace(/```$/, "");
        return (
          <div key={i} style={{
            background: "#0d0d0d",
            border: "1px solid #2d2d2d",
            borderRadius: "12px",
            marginTop: "12px",
            overflow: "hidden",
          }}>
            {/* Code header */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 16px",
              background: "#161616",
              borderBottom: "1px solid #2d2d2d",
            }}>
              <div style={{ display: "flex", gap: "0" }}>
                {["code", ...(hasPreview ? ["preview"] : [])].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => onTabChange(tab as "code" | "preview")}
                    style={{
                      padding: "4px 14px",
                      background: activeTab === tab ? "#2d2d2d" : "transparent",
                      border: "none",
                      borderRadius: "6px",
                      color: activeTab === tab ? "#ececec" : "#8e8ea0",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s",
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {lang && <span style={{ fontSize: "11px", color: "#8e8ea0" }}>{lang}</span>}
                <CopyBtn text={code} />
              </div>
            </div>

            {/* Code or preview */}
            {activeTab === "preview" && hasPreview ? (
              <div style={{ background: "#fff", height: "480px" }}>
                <iframe
                  key={msg.preview}
                  srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{box-sizing:border-box}</style></head><body>${msg.preview}</body></html>`}
                  title="preview"
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                  sandbox="allow-scripts allow-same-origin allow-modals"
                />
              </div>
            ) : (
              <pre style={{
                padding: "20px",
                margin: 0,
                fontFamily: "'Söhne Mono', 'Courier New', monospace",
                fontSize: "13px",
                lineHeight: "1.7",
                color: "#c9d1d9",
                overflowX: "auto",
                maxHeight: "480px",
                overflowY: "auto",
                background: "#0d0d0d",
              }}>
                <code>{code}</code>
              </pre>
            )}
          </div>
        );
      }
      return part.trim() ? (
        <p key={i} style={{
          color: "#ececec",
          fontSize: "16px",
          lineHeight: "1.7",
          fontFamily: "'Söhne', ui-sans-serif, system-ui, -apple-system, sans-serif",
          marginBottom: "4px",
        }}>{part.trim()}</p>
      ) : null;
    });
  };

  return (
    <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
      {/* GPT icon */}
      <div style={{
        width: "30px", height: "30px", borderRadius: "50%",
        background: "#19c37d",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: "2px",
      }}>
        <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
          <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.337 10.079 10.079 0 00-9.612 6.923 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.336 10.078 10.078 0 009.617-6.923 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.817z" fill="white"/>
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0, paddingTop: "4px" }}>
        {renderContent(msg.content)}
      </div>
    </div>
  );
}

export default function ChatGPTCodeGen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tabStates, setTabStates] = useState<Record<number, "code" | "preview">>({});
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const isEmptyState = messages.length === 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (promptOverride?: string) => {
    const text = (promptOverride || input).trim();
    if (!text || loading) return;

    setInput("");
    setShowSuggestions(false);
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      const { code, preview } = extractCode(data.result);
      const asstMsg: Message = {
        role: "assistant",
        content: data.result,
        code,
        preview,
        tab: "code",
      };
      setMessages((prev) => [...prev, asstMsg]);
    } catch (e: unknown) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: `Sorry, something went wrong: ${e instanceof Error ? e.message : "Unknown error"}`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (idx: number, tab: "code" | "preview") => {
    setMessages((prev) => prev.map((m, i) => i === idx ? { ...m, tab } : m));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #212121; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3d3d3d; border-radius: 3px; }
        .send-btn:hover:not(:disabled) { background: #676767 !important; }
        .suggest-btn:hover { background: #2f2f2f !important; border-color: #4d4d4d !important; }
        .sidebar-item:hover { background: #2d2d2d !important; }
        textarea::placeholder { color: #8e8ea0; }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        background: "#212121",
        fontFamily: "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif",
        overflow: "hidden",
      }}>

       

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Top bar */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "12px 20px",
            borderBottom: "1px solid #2d2d2d",
            flexShrink: 0,
          }}>
            <button style={{
              display: "flex", alignItems: "center", gap: "6px",
              background: "none", border: "none",
              color: "#ececec", fontSize: "15px",
              fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit",
            }}>
              Code Generator
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: isEmptyState ? "0" : "24px 0",
          }}>

            {isEmptyState ? (
              /* Empty / welcome state */
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                height: "100%", padding: "40px 24px",
                gap: "32px",
              }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: "#19c37d",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 20px",
                  }}>
                    <svg width="24" height="24" viewBox="0 0 41 41" fill="none">
                      <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.337 10.079 10.079 0 00-9.612 6.923 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.336 10.078 10.078 0 009.617-6.923 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.817z" fill="white"/>
                    </svg>
                  </div>
                  <h1 style={{
                    fontSize: "28px", fontWeight: 600,
                    color: "#ececec", marginBottom: "8px",
                  }}>What can I help with?</h1>
                </div>

                {/* Suggestion pills */}
                {showSuggestions && (
                  <div style={{
                    display: "flex", flexWrap: "wrap",
                    gap: "10px", justifyContent: "center",
                    maxWidth: "600px",
                  }}>
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        className="suggest-btn"
                        onClick={() => send(s)}
                        style={{
                          padding: "10px 18px",
                          background: "#2f2f2f",
                          border: "1px solid #3d3d3d",
                          borderRadius: "20px",
                          color: "#c5c5d2",
                          fontSize: "14px",
                          cursor: "pointer",
                          fontFamily: "inherit",
                          transition: "all 0.15s",
                        }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Message thread */
              <div style={{ maxWidth: "760px", margin: "0 auto", padding: "0 24px" }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ marginBottom: "32px" }}>
                    {msg.role === "user" ? (
                      /* User bubble */
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{
                          background: "#2f2f2f",
                          borderRadius: "18px",
                          padding: "12px 18px",
                          maxWidth: "80%",
                          color: "#ececec",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          fontFamily: "'Inter', sans-serif",
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    ) : (
                      <AssistantMessage
                        msg={msg}
                        onTabChange={(tab) => handleTabChange(i, tab)}
                      />
                    )}
                  </div>
                ))}

                {/* Loading dots */}
                {loading && (
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", marginBottom: "32px" }}>
                    <div style={{
                      width: "30px", height: "30px", borderRadius: "50%",
                      background: "#19c37d",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 41 41" fill="none">
                        <path d="M37.532 16.87a9.963 9.963 0 00-.856-8.184 10.078 10.078 0 00-10.855-4.835 9.964 9.964 0 00-7.505-3.337 10.079 10.079 0 00-9.612 6.923 9.967 9.967 0 00-6.664 4.834 10.08 10.08 0 001.24 11.817 9.965 9.965 0 00.856 8.185 10.079 10.079 0 0010.855 4.835 9.965 9.965 0 007.504 3.336 10.078 10.078 0 009.617-6.923 9.967 9.967 0 006.663-4.834 10.079 10.079 0 00-1.243-11.817z" fill="white"/>
                      </svg>
                    </div>
                    <div style={{ paddingTop: "8px", display: "flex", gap: "5px", alignItems: "center" }}>
                      {[0, 1, 2].map(i => (
                        <div key={i} style={{
                          width: "7px", height: "7px",
                          borderRadius: "50%",
                          background: "#8e8ea0",
                          animation: `bounce 1.2s ease infinite ${i * 0.2}s`,
                        }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          <div style={{
            padding: "16px 24px 24px",
            flexShrink: 0,
          }}>
            <div style={{
              maxWidth: "760px",
              margin: "0 auto",
              background: "#2f2f2f",
              borderRadius: "16px",
              padding: "12px 14px 12px 18px",
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              border: "1px solid #3d3d3d",
              boxShadow: "0 2px 12px #00000044",
            }}>
              <AutoResizeTextarea
                value={input}
                onChange={setInput}
                onSubmit={send}
                placeholder="Ask anything"
              />

              {/* Send button */}
              <button
                className="send-btn"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                style={{
                  width: "34px", height: "34px",
                  borderRadius: "8px",
                  background: input.trim() && !loading ? "#ececec" : "#4d4d4d",
                  border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {loading ? (
                  <div style={{
                    width: "14px", height: "14px",
                    border: "2px solid #8e8ea0",
                    borderTopColor: "#ececec",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4l0 16M12 4l-4 4M12 4l4 4" stroke={input.trim() ? "#212121" : "#8e8ea0"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

            <p style={{
              textAlign: "center", fontSize: "12px",
              color: "#8e8ea0", marginTop: "10px",
              fontFamily: "inherit",
            }}>
              AI Code Generator can make mistakes. Press Enter to send, Shift+Enter for new line.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}