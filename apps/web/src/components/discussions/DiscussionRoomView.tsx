'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Send,
  Image as ImageIcon,
  Loader2,
  UserPlus,
  ShieldCheck,
  MapPin,
  Sparkles,
  Info,
  LogOut,
  X,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import {
  fetchDiscussionByIdApi,
  fetchDiscussionMessagesApi,
  sendDiscussionMessageApi,
  joinChannelApi,
  uploadMediaApi,
  getApiBaseUrl,
} from '../../lib/api';
import { DiscussionRoom, DiscussionMessage, DiscussionMember } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { AddMemberModal } from './AddMemberModal';

interface DiscussionRoomViewProps {
  roomId: string;
  onBack: () => void;
}

export const DiscussionRoomView: React.FC<DiscussionRoomViewProps> = ({ roomId, onBack }) => {
  const { language, currentUser, isAuthenticated, setIsAuthModalOpen } = useAppStore();
  const t = getT(language);

  const [room, setRoom] = useState<DiscussionRoom | null>(null);
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [members, setMembers] = useState<DiscussionMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [showMembersList, setShowMembersList] = useState(false);
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadRoomData = async () => {
    try {
      const data = await fetchDiscussionByIdApi(roomId);
      if (data) {
        setRoom(data);
        if (data.members) setMembers(data.members);
      }
    } catch (err) {
      console.warn('Error loading room:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await fetchDiscussionMessagesApi(roomId);
      setMessages(msgs || []);
      setAccessDeniedMessage(null);
    } catch (err: any) {
      if (err.message?.includes('private') || err.message?.includes('member')) {
        setAccessDeniedMessage(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadRoomData();
    loadMessages();

    // Real-time EventSource Stream for instant live messages
    let eventSource: EventSource | null = null;
    try {
      const apiBase = getApiBaseUrl();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      const streamUrl = apiBase.startsWith('http')
        ? `${apiBase}/discussions/${roomId}/stream`
        : `${origin}${apiBase}/discussions/${roomId}/stream`;

      eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === parsed.id)) return prev;
              return [...prev, parsed];
            });
            setTimeout(scrollToBottom, 50);
          }
        } catch (e) {
          console.warn('Realtime event parse error:', e);
        }
      };
    } catch (e) {
      console.warn('EventSource failed, falling back to polling:', e);
    }

    // Safety fallback polling every 8s
    const interval = setInterval(() => {
      loadMessages();
    }, 8000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, [roomId]);

  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [messages.length, isLoading]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    setIsJoining(true);
    try {
      await joinChannelApi(roomId);
      await loadRoomData();
      await loadMessages();
    } catch (err: any) {
      alert(err.message || 'Could not join channel');
    } finally {
      setIsJoining(false);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !mediaUrl) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    setIsSending(true);
    const contentToSend = inputText.trim();
    const mediaToSend = mediaUrl;

    try {
      const sent = await sendDiscussionMessageApi(roomId, {
        content: contentToSend,
        mediaUrl: mediaToSend || undefined,
      });

      setMessages((prev) => [...prev, sent]);
      setInputText('');
      setMediaUrl('');
      scrollToBottom();
      loadRoomData();
    } catch (err: any) {
      console.error('Send error:', err);
      alert(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadMediaApi(file);
      setMediaUrl(res.url);
    } catch (err) {
      alert(
        language === 'ml'
          ? 'ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല'
          : 'Failed to upload photo'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[calc(100vh-100px)] bg-white rounded-3xl border border-[#E4EBE6] shadow-2xs overflow-hidden">
      {/* Room Header */}
      <div className="p-3.5 sm:p-4 border-b border-[#E4EBE6] bg-white/95 backdrop-blur-xs flex items-center justify-between gap-2 z-10 flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="p-1.5 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
            title="Back to all discussions"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-extrabold text-sm sm:text-base text-[#17231D] truncate leading-tight">
                {room?.name || 'Discussion Room'}
              </h3>

              {room?.type === 'CHANNEL' ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  <Globe className="w-3 h-3" />
                  <span>{language === 'ml' ? 'പൊതു ചാനൽ' : 'Channel'}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                  <Lock className="w-3 h-3" />
                  <span>{language === 'ml' ? 'സ്വകാര്യ സംഘം' : 'Private Group'}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#718078] mt-0.5">
              {room?.locality && (
                <span className="flex items-center gap-1 font-medium text-[#16A34A]">
                  <MapPin className="w-3 h-3" />
                  <span>{room.locality}</span>
                </span>
              )}
              <span>·</span>
              <button
                onClick={() => setShowMembersList(true)}
                className="hover:underline text-[#718078] font-medium"
              >
                {room?.membersCount || members.length} {language === 'ml' ? 'അംഗങ്ങൾ' : 'members'}
              </button>
            </div>
          </div>
        </div>

        {/* Room Header Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* If private group and user is member, show Add Member */}
          {room?.type === 'GROUP' && room.isMember && (
            <button
              onClick={() => setIsAddMemberOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all active-press"
              title="Add member by phone"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'ml' ? 'അംഗത്തെ ചേർക്കുക' : 'Add Member'}
              </span>
            </button>
          )}

          {/* If public channel and not member, show Join */}
          {room?.type === 'CHANNEL' && !room.isMember && (
            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all active-press shadow-xs disabled:opacity-50"
            >
              {isJoining ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Users className="w-3.5 h-3.5" />
              )}
              <span>{language === 'ml' ? 'ചാനലിൽ ചേരുക' : 'Join Channel'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Thread or Private Group Lock Screen */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F8FAF8]">
        {/* Room Pinned Goal Banner */}
        {room?.description && (
          <div className="p-3 rounded-2xl bg-white border border-[#E4EBE6] shadow-2xs text-xs text-[#718078] flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#16A34A] flex-shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold text-[#17231D]">
                {language === 'ml' ? 'ചർച്ചയുടെ ലക്ഷ്യം: ' : 'Objective: '}
              </span>
              <span>{room.description}</span>
            </div>
          </div>
        )}

        {accessDeniedMessage ? (
          /* Private Group Access Gate */
          <div className="my-12 p-8 max-w-md mx-auto bg-white rounded-3xl border border-amber-200 shadow-sm text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#17231D]">
                {language === 'ml' ? 'സ്വകാര്യ സംഘം' : 'Private Group'}
              </h4>
              <p className="text-xs text-[#718078] mt-1.5 leading-relaxed">
                {language === 'ml'
                  ? 'ഈ ചർച്ച ഒരു സ്വകാര്യ സംഘത്തിലാണ്. ഇതിൽ അംഗമായ ഒരാൾ നിങ്ങളുടെ ഫോൺ നമ്പർ ചേർക്കുമ്പോൾ മാത്രമേ നിങ്ങൾക്ക് സന്ദേശങ്ങൾ കാണാനും അയക്കാനും കഴിയൂ.'
                  : 'This space is a private action group. New members can only join when added by an existing member of this group.'}
              </p>
            </div>
            {!isAuthenticated ? (
              <button
                onClick={() => setIsAuthModalOpen(true, 'login')}
                className="px-5 py-2.5 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-xs active-press"
              >
                {t.auth.signIn}
              </button>
            ) : (
              <div className="p-3 bg-amber-50/70 rounded-xl text-[11px] text-amber-800 font-semibold border border-amber-200/60">
                {language === 'ml'
                  ? 'കൂട്ടായ്മയിലെ ഏതെങ്കിലും അംഗത്തോട് നിങ്ങളുടെ നമ്പർ ചേർക്കാൻ ആവശ്യപ്പെടുക.'
                  : 'Ask an organizer or member of this group to add your mobile number.'}
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20 text-[#718078]">
            <Loader2 className="w-6 h-6 animate-spin text-[#16A34A]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 space-y-2 text-[#718078]">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-[#17231D]">
              {language === 'ml' ? 'ആദ്യത്തെ സന്ദേശം പങ്കുവെക്കൂ' : 'Start the conversation'}
            </h4>
            <p className="text-xs max-w-xs mx-auto">
              {language === 'ml'
                ? 'പ്രശ്നത്തെക്കുറിച്ചും പരിഹാരങ്ങളെക്കുറിച്ചും നാട്ടുകാരോട് സംസാരിക്കൂ.'
                : 'Share observations, evidence photos, or ideas to resolve this civic issue together.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <Link
                    href={`/profile?id=${encodeURIComponent(msg.senderId)}&username=${encodeURIComponent((msg.sender?.fullName || 'citizen').toLowerCase().replace(/\s+/g, '_'))}`}
                    className="flex-shrink-0 mb-1 hover:opacity-85 transition-opacity"
                    title={`View ${msg.sender?.fullName || 'Citizen'}'s profile`}
                  >
                    <UserAvatar
                      src={msg.sender?.avatarUrl}
                      name={msg.sender?.fullName || 'Citizen'}
                      size="xs"
                    />
                  </Link>
                )}

                <div
                  className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 space-y-1 shadow-2xs ${
                    isMe
                      ? 'bg-[#16A34A] text-white rounded-br-xs'
                      : 'bg-white text-[#17231D] border border-[#E4EBE6] rounded-bl-xs'
                  }`}
                >
                  {!isMe && (
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#16A34A]">
                      <Link
                        href={`/profile?id=${encodeURIComponent(msg.senderId)}&username=${encodeURIComponent((msg.sender?.fullName || 'citizen').toLowerCase().replace(/\s+/g, '_'))}`}
                        className="hover:underline truncate"
                      >
                        {msg.sender?.fullName}
                      </Link>
                      {msg.sender?.locality && (
                        <span className="text-[9px] text-[#718078] font-normal truncate">
                          · {msg.sender.locality}
                        </span>
                      )}
                    </div>
                  )}

                  {msg.mediaUrl && (
                    <div className="rounded-xl overflow-hidden my-1 max-h-56 bg-black/10">
                      <img
                        src={msg.mediaUrl}
                        alt="Discussion Attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <p className="text-xs leading-relaxed whitespace-pre-line select-text">
                    {msg.content}
                  </p>

                  <div
                    className={`text-[9px] text-right font-medium ${
                      isMe ? 'text-emerald-100' : 'text-[#718078]'
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Composer Bar */}
      {!accessDeniedMessage && (
        <div className="p-3 border-t border-[#E4EBE6] bg-white flex-shrink-0 space-y-2">
          {mediaUrl && (
            <div className="relative inline-block border border-[#D1EBD9] rounded-xl overflow-hidden">
              <img src={mediaUrl} alt="Attached" className="w-16 h-16 object-cover" />
              <button
                onClick={() => setMediaUrl('')}
                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  fileInputRef.current?.click();
                }
              }}
              className="p-2.5 rounded-xl border border-[#E4EBE6] hover:bg-[#F8FAF8] text-[#718078] hover:text-[#16A34A] transition-colors"
              title="Attach photo / evidence"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#16A34A]" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onFocus={() => {
                if (!isAuthenticated) setIsAuthModalOpen(true, 'login');
              }}
              placeholder={
                language === 'ml'
                  ? 'സന്ദേശം രേഖപ്പെടുത്തുക...'
                  : 'Message community members...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] focus:border-[#16A34A] text-xs text-[#17231D] outline-none shadow-2xs"
            />

            <button
              type="submit"
              disabled={isSending || (!inputText.trim() && !mediaUrl)}
              className="p-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-40 text-white transition-all active-press shadow-xs"
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      )}

      {/* Add Member Modal for Private Groups */}
      <AddMemberModal
        isOpen={isAddMemberOpen}
        roomId={roomId}
        roomName={room?.name || ''}
        onClose={() => setIsAddMemberOpen(false)}
        onMemberAdded={() => {
          loadRoomData();
          loadMessages();
        }}
      />

      {/* Members Drawer Modal */}
      {showMembersList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-[#E4EBE6] space-y-3">
            <div className="flex items-center justify-between border-b border-[#E4EBE6] pb-2.5">
              <h4 className="text-sm font-bold text-[#17231D] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#16A34A]" />
                <span>{language === 'ml' ? 'അംഗങ്ങളുടെ പട്ടിക' : 'Group Members'}</span>
              </h4>
              <button
                onClick={() => setShowMembersList(false)}
                className="p-1 rounded-lg text-[#718078] hover:bg-[#F8FAF8]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6]"
                >
                  <Link
                    href={`/profile?id=${encodeURIComponent(m.user?.id || m.userId)}&username=${encodeURIComponent((m.user?.fullName || 'citizen').toLowerCase().replace(/\s+/g, '_'))}`}
                    className="flex items-center gap-2.5 min-w-0 hover:opacity-85 transition-opacity"
                    title={`View ${m.user?.fullName || 'Citizen'}'s profile`}
                  >
                    <UserAvatar
                      src={m.user?.avatarUrl}
                      name={m.user?.fullName || 'Citizen'}
                      size="xs"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-[#17231D] hover:text-[#16A34A] transition-colors truncate">
                        {m.user?.fullName}
                      </div>
                      <div className="text-[10px] text-[#718078] truncate">
                        {m.user?.locality || 'Kerala'}
                      </div>
                    </div>
                  </Link>
                  {m.role === 'ADMIN' && (
                    <span className="text-[9px] font-bold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-2 py-0.5 rounded-full">
                      Admin
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
