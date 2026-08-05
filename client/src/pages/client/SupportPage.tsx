import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Loader2, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi } from "../../api/clientApi";
import { useLang } from "../../i18n/LangContext";
import { useAuthStore } from "../../store/authStore";

export default function SupportPage() {
  const { dir, ui, lang } = useLang();
  const { user } = useAuthStore();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["client-support"],
    queryFn:  () => clientApi.getSupport().then((r) => r.data.messages),
    refetchInterval: 15_000,
  });

  const messages = data || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    try {
      await clientApi.sendSupport(text.trim());
      setText("");
      qc.invalidateQueries({ queryKey: ["client-support"] });
      qc.invalidateQueries({ queryKey: ["client-support-unread"] });
    } catch {
      toast.error(ui.client.sendError);
    } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  return (
    <div className="max-w-2xl mx-auto" dir={dir}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ofoq-navy">{ui.client.support}</h1>
        <p className="text-gray-500 text-sm mt-1">{ui.client.supportSub}</p>
      </div>

      {/* Chat box */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col" style={{ height: "60vh" }}>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin text-gray-300" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <MessageCircle size={40} className="text-gray-200 mb-3" />
              <p className="text-gray-400 text-sm font-medium">{ui.client.noMessages}</p>
              <p className="text-gray-300 text-xs mt-1">{ui.client.noMessagesSub}</p>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg: any) => {
                const isClient = msg.from === "client";
                return (
                  <motion.div key={msg._id || msg.createdAt}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isClient ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[78%] ${isClient ? "items-end" : "items-start"} flex flex-col gap-1`}>
                      <span className="text-xs text-gray-400 px-1">
                        {isClient ? (user?.name || ui.client.you) : msg.senderName}
                      </span>
                      <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isClient
                          ? "bg-ofoq-navy text-white rounded-tl-sm"
                          : "bg-gray-100 text-gray-800 rounded-tr-sm"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-xs text-gray-300 px-1">
                         {new Date(msg.createdAt).toLocaleTimeString(lang, { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              placeholder={ui.client.supportPlaceholder}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none max-h-24"
              style={{ minHeight: "46px" }}
            />
            <button onClick={send} disabled={!text.trim() || sending}
              className="w-11 h-11 bg-ofoq-navy text-white rounded-xl flex items-center justify-center hover:bg-ofoq-red disabled:opacity-50 transition-all flex-shrink-0 self-end">
              {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-300 mt-1.5 text-center">
             {ui.client.supportSub}
          </p>
        </div>
      </div>
    </div>
  );
}
