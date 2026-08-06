import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { clientApi } from "../../../api/clientApi";
import { useAuthStore } from "../../../store/authStore";
import { useLang } from "../../../i18n/LangContext";

export default function AdminSupportPage() {
  const { user } = useAuthStore();
  const { ui, dir, lang } = useLang();
  const qc = useQueryClient();
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const { data: convsData, isLoading: convsLoading } = useQuery({
    queryKey: ["admin-support-conversations"],
    queryFn:  () => clientApi.adminGetConversations().then((r) => r.data.conversations),
    refetchInterval: 20_000,
  });

  const { data: msgsData, isLoading: msgsLoading } = useQuery({
    queryKey: ["admin-support-messages", selectedClient],
    queryFn:  () => clientApi.adminGetConversation(selectedClient!).then((r) => r.data.messages),
    enabled:  !!selectedClient,
    refetchInterval: 10_000,
  });

  const conversations = convsData || [];
  const messages      = msgsData  || [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    if (!text.trim() || !selectedClient) return;
    setSending(true);
    try {
      await clientApi.adminReply(selectedClient, text.trim());
      setText("");
      qc.invalidateQueries({ queryKey: ["admin-support-messages", selectedClient] });
      qc.invalidateQueries({ queryKey: ["admin-support-conversations"] });
    } catch {
      toast.error(ui.client.sendError);
    } finally { setSending(false); }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  }

  const selectedConv = conversations.find((c: any) => c.clientId === selectedClient);

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4" dir={dir}>
      {/* Conversations list */}
      <div className="w-72 lg:w-80 flex-shrink-0 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-bold text-ofoq-navy text-base">{ui.client.support}</h2>
          <p className="text-gray-400 text-xs mt-0.5">{conversations.length} {ui.client.messages}</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convsLoading ? (
            <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10">
              <MessageCircle size={28} className="text-gray-200 mx-auto mb-2" />
              <p className="text-gray-300 text-xs">{ui.client.noMessages}</p>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <button key={conv.clientId} onClick={() => setSelectedClient(conv.clientId)}
                className={`w-full text-right p-4 border-b border-gray-50 hover:bg-gray-50/60 transition-colors ${
                  selectedClient === conv.clientId ? "bg-ofoq-navy/5 border-r-2 border-r-ofoq-navy" : ""
                }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-ofoq-navy/10 flex items-center justify-center flex-shrink-0 text-ofoq-navy font-bold text-sm">
                    {conv.client?.fullName?.charAt(0) || ui.client.client.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-ofoq-navy truncate">
                        {conv.client?.fullName || ui.client.client}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="bg-ofoq-red text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-xs truncate mt-0.5">{conv.lastMessage}</p>
                    <p className="text-gray-300 text-xs mt-0.5">
                      {new Date(conv.lastDate).toLocaleDateString(lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang)}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!selectedClient ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <MessageCircle size={48} className="text-gray-200 mb-4" />
            <p className="text-gray-400 font-medium">{ui.client.support}</p>
            <p className="text-gray-300 text-sm mt-1">{ui.client.supportSub}</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-ofoq-navy/10 flex items-center justify-center text-ofoq-navy font-bold text-sm">
                {selectedConv?.client?.fullName?.charAt(0) || ui.client.client.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-sm text-ofoq-navy">
                  {selectedConv?.client?.fullName || ui.client.client}
                </p>
                <p className="text-gray-400 text-xs">{selectedConv?.client?.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgsLoading ? (
                <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-gray-300" /></div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-gray-300 text-sm">{ui.client.noMessages}</div>
              ) : (
                <AnimatePresence>
                  {messages.map((msg: any) => {
                    const isAdmin = msg.from === "admin";
                    return (
                      <motion.div key={msg._id || msg.createdAt}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[72%] flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
                          <span className="text-xs text-gray-400 px-1">
                            {isAdmin ? (user?.name || ui.client.client) : msg.senderName}
                          </span>
                          <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                            isAdmin
                              ? "bg-ofoq-navy text-white rounded-tl-sm"
                              : "bg-gray-100 text-gray-800 rounded-tr-sm"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-xs text-gray-300 px-1">
                            {new Date(msg.createdAt).toLocaleTimeString(lang === "ar" ? "ar-SA" : lang === "ur" ? "ur-PK" : lang, { hour: "2-digit", minute: "2-digit" })}
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
                <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={handleKey}
                  rows={1} placeholder={ui.client.supportPlaceholder}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-ofoq-navy/30 resize-none max-h-24"
                  style={{ minHeight: "46px" }} />
                <button onClick={send} disabled={!text.trim() || sending}
                  className="w-11 h-11 bg-ofoq-navy text-white rounded-xl flex items-center justify-center hover:bg-ofoq-red disabled:opacity-50 transition-all flex-shrink-0 self-end">
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
