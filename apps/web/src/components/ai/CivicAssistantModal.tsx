'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  MapPin,
  ExternalLink,
  Building2,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { askAiAssistantApi, AiCivicResponse } from '../../lib/api';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  relevantIssues?: AiCivicResponse['relevantIssues'];
  relevantProjects?: AiCivicResponse['relevantProjects'];
}

interface CivicAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CivicAssistantModal: React.FC<CivicAssistantModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, currentLocality, currentUser } = useAppStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'assistant',
      text:
        language === 'ml'
          ? `നമസ്കാരം! ഞാൻ നാട്ടുകൂട്ടം AI പൗരസഹായിയാണ്. ${currentLocality || 'നിങ്ങളുടെ വാർഡിലെ'} റോഡ് പണികൾ, കുടിവെള്ള പ്രശ്നങ്ങൾ, വൈദ്യുതി തടസ്സങ്ങൾ, സർക്കാർ പദ്ധതികൾ എന്നിവയെക്കുറിച്ച് എന്നോട് ചോദിക്കാം.`
          : `Hello! I am your Naatukoottam AI Civic Assistant. Ask me anything about ongoing road works, water leaks, power disruptions, or infrastructure projects in ${currentLocality || 'your ward'}.`,
      time: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const quickChips = [
    language === 'ml'
      ? 'റോഡ് നിർമ്മാണ വിവരങ്ങൾ എന്തൊക്കെ?'
      : 'What road works are happening?',
    language === 'ml'
      ? 'കുടിവെള്ള പ്രശ്നങ്ങൾ ഉണ്ടോ?'
      : 'Any water pipeline issues?',
    language === 'ml'
      ? 'അടിയന്തര ശ്രദ്ധ ആവശ്യമുള്ള പരാതികൾ?'
      : 'Critical complaints needing attention?',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsLoading(true);

    try {
      const res = await askAiAssistantApi(
        textToSend.trim(),
        currentLocality || 'Kakkanad',
        currentUser.district || 'Ernakulam'
      );

      const assistantMsg: Message = {
        id: `a_${Date.now()}`,
        sender: 'assistant',
        text: res.answer,
        time: 'Just now',
        relevantIssues: res.relevantIssues,
        relevantProjects: res.relevantProjects,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text:
            language === 'ml'
              ? 'ക്ഷമിക്കണം, താല്ക്കാലികമായി കണക്ഷൻ സാധ്യമായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.'
              : 'Sorry, could not connect to AI Assistant. Please try again in a moment.',
          time: 'Just now',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E4EBE6] shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-3.5 bg-gradient-to-r from-[#17231D] to-[#1F332A] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#16A34A] flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm">
                  {language === 'ml' ? 'AI പൗരസഹായി' : 'AI Civic Assistant'}
                </h3>
                <span className="text-[9px] font-bold bg-white/20 text-emerald-200 px-1.5 py-0.2 rounded">
                  Groq 120B
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                <MapPin className="w-2.5 h-2.5" />
                <span>{currentLocality || 'Kakkanad'} Ward Radar</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAF8]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-2xs ${
                      isUser
                        ? 'bg-[#16A34A] text-white rounded-tr-xs'
                        : 'bg-white text-[#17231D] border border-[#E4EBE6] rounded-tl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Cited Relevant Database Issues */}
                  {!isUser && msg.relevantIssues && msg.relevantIssues.length > 0 && (
                    <div className="space-y-1.5 pt-1 w-full">
                      <span className="text-[10px] font-bold text-[#718078] uppercase tracking-wider block">
                        {language === 'ml' ? 'ബന്ധപ്പെട്ട പരാതികൾ' : 'Cited Civic Records'}
                      </span>
                      {msg.relevantIssues.map((issue) => (
                        <div
                          key={issue.id}
                          className="p-2 bg-white rounded-xl border border-[#D1EBD9] text-xs flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="truncate">
                            <span className="font-semibold text-[#17231D] block truncate">
                              {issue.title}
                            </span>
                            <span className="text-[10px] text-[#16A34A] font-bold">
                              {issue.department || 'PWD'} · {issue.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-full bg-[#17231D] text-white flex items-center justify-center flex-shrink-0 mt-0.5 text-xs">
                    <UserIcon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-[#718078]">
              <div className="w-7 h-7 rounded-full bg-[#16A34A] text-white flex items-center justify-center flex-shrink-0 text-xs animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="p-3 bg-white rounded-2xl border border-[#E4EBE6] text-xs shadow-2xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
                <span>
                  {language === 'ml'
                    ? 'വാർഡ് ഡാറ്റ പരിശോധിക്കുന്നു...'
                    : 'Querying live ward records...'}
                </span>
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Quick Query Chips */}
        <div className="p-2 bg-white border-t border-[#E4EBE6] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(chip)}
              className="px-2.5 py-1 rounded-full bg-[#EAF7EF] hover:bg-[#d8f2de] border border-[#D1EBD9] text-[#16A34A] text-[10.5px] font-semibold whitespace-nowrap transition-colors active-press cursor-pointer flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Message Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-white border-t border-[#E4EBE6] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              language === 'ml'
                ? 'വാർഡിലെ പ്രശ്നങ്ങളെക്കുറിച്ച് ചോദിക്കൂ...'
                : 'Ask about road works, leaks, power outages...'
            }
            className="flex-1 bg-[#F8FAF8] rounded-xl px-3.5 py-2 text-xs border border-[#E4EBE6] focus:border-[#16A34A] focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="p-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer active-press"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CivicAssistantModal;

