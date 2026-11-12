'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MessageSquare,
  Users,
  Globe,
  Lock,
  Plus,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Loader2,
  Filter,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { fetchDiscussionsApi, joinChannelApi } from '../../lib/api';
import { DiscussionRoom, DiscussionRoomType } from '../../types';
import { CreateDiscussionModal } from './CreateDiscussionModal';
import { DiscussionRoomView } from './DiscussionRoomView';
import { UserAvatar } from '../ui/UserAvatar';

export const DiscussionsListView: React.FC = () => {
  const searchParams = useSearchParams();
  const roomParam = searchParams.get('room');

  const { language, currentLocality, isAuthenticated, setIsAuthModalOpen } = useAppStore();
  const t = getT(language);

  const [rooms, setRooms] = useState<DiscussionRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(roomParam || null);
  const [filterType, setFilterType] = useState<'ALL' | DiscussionRoomType>('ALL');

  useEffect(() => {
    if (roomParam) {
      setSelectedRoomId(roomParam);
    }
  }, [roomParam]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const loadDiscussions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDiscussionsApi({
        type: filterType,
        search: searchQuery.trim() || undefined,
      });
      setRooms(data || []);
    } catch (err) {
      console.warn('Failed to load discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, [filterType, searchQuery]);

  if (selectedRoomId) {
    return (
      <DiscussionRoomView
        roomId={selectedRoomId}
        onBack={() => {
          setSelectedRoomId(null);
          loadDiscussions();
        }}
      />
    );
  }

  const publicChannels = rooms.filter((r) => r.type === 'CHANNEL');
  const privateGroups = rooms.filter((r) => r.type === 'GROUP');

  return (
    <div className="space-y-4 pb-24 sm:pb-12">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E4EBE6] shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#15803D] text-white shadow-xs">
              <MessageSquare className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-[#17231D]">
                {language === 'ml' ? 'കമ്മ്യൂണിറ്റി ചർച്ചകൾ' : 'Community Discussions'}
              </h2>
              <p className="text-xs text-[#718078]">
                {language === 'ml'
                  ? 'പ്രദേശിക പ്രശ്നങ്ങൾ പരിഹരിക്കാൻ ചാനലുകളും സ്വകാര്യ സംഘങ്ങളും'
                  : 'Join public channels or private groups to resolve common neighborhood issues'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                setIsAuthModalOpen(true, 'login');
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all active-press shadow-xs"
          >
            <Plus className="w-4 h-4 stroke-[2.6]" />
            <span>{language === 'ml' ? 'പുതിയ ചർച്ച ആരംഭിക്കുക' : 'Start Discussion'}</span>
          </button>
        </div>

        {/* Feature Explainer Pill: Channel vs Group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 flex items-start gap-2">
            <Globe className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold text-emerald-900">
                {language === 'ml' ? '📢 പൊതു ചാനൽ: ' : '📢 Public Channel: '}
              </span>
              <span className="text-emerald-800">
                {language === 'ml'
                  ? 'ആർക്കും സ്വതന്ത്രമായി ഇതിൽ ചേരാം, പൊതുവായ വിഷയങ്ങൾ സംസാരിക്കാം.'
                  : 'Open to everyone; anyone can join and participate in open civic dialogue.'}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] leading-snug">
              <span className="font-bold text-amber-900">
                {language === 'ml' ? '🔒 സ്വകാര്യ സംഘം: ' : '🔒 Private Group: '}
              </span>
              <span className="text-amber-800">
                {language === 'ml'
                  ? 'നിലവിലെ അംഗങ്ങൾ ഫോൺ നമ്പർ ചേർക്കുമ്പോൾ മാത്രമേ മറ്റുള്ളവർക്ക് ചേരാൻ കഴിയൂ.'
                  : 'Strictly private taskforce; can only join when added by an existing member.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="bg-white p-1 rounded-2xl border border-[#E4EBE6] shadow-2xs flex items-center">
          <button
            onClick={() => setFilterType('ALL')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterType === 'ALL'
                ? 'bg-[#16A34A] text-white shadow-xs font-bold'
                : 'text-[#718078] hover:text-[#17231D]'
            }`}
          >
            {language === 'ml' ? 'എല്ലാം' : 'All Spaces'} ({rooms.length})
          </button>
          <button
            onClick={() => setFilterType('CHANNEL')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              filterType === 'CHANNEL'
                ? 'bg-[#16A34A] text-white shadow-xs font-bold'
                : 'text-[#718078] hover:text-[#17231D]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'ചാനലുകൾ' : 'Channels'}</span>
          </button>
          <button
            onClick={() => setFilterType('GROUP')}
            className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              filterType === 'GROUP'
                ? 'bg-[#16A34A] text-white shadow-xs font-bold'
                : 'text-[#718078] hover:text-[#17231D]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>{language === 'ml' ? 'സംഘങ്ങൾ' : 'Groups'}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 text-[#718078] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'ml'
                ? 'ചർച്ചകൾ തിരയുക...'
                : 'Search groups, channels...'
            }
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl text-xs text-[#17231D] outline-none shadow-2xs"
          />
        </div>
      </div>

      {/* Discussion Rooms List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-12 text-center text-[#718078]">
            <Loader2 className="w-6 h-6 animate-spin text-[#16A34A] mx-auto mb-2" />
            <p className="text-xs">{language === 'ml' ? 'ചർച്ചകൾ ലോഡ് ചെയ്യുന്നു...' : 'Loading discussion spaces...'}</p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-10 bg-white rounded-3xl border border-[#E4EBE6] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#16A34A] flex items-center justify-center mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17231D]">
                {language === 'ml' ? 'ചർച്ചകളൊന്നും കണ്ടെത്തിയില്ല' : 'No discussions yet in this category'}
              </h4>
              <p className="text-xs text-[#718078] mt-1 max-w-sm mx-auto">
                {language === 'ml'
                  ? 'നിങ്ങളുടെ വാർഡിലെ പ്രശ്നങ്ങൾ പരിഹരിക്കാൻ ആദ്യത്തെ ചാനലോ ഗ്രൂപ്പോ രൂപീകരിക്കൂ!'
                  : 'Be the first to start a civic action channel or neighborhood taskforce group!'}
              </p>
            </div>
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#16A34A] text-white text-xs font-bold shadow-xs active-press"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'ml' ? 'ചർച്ച ആരംഭിക്കുക' : 'Start Space'}</span>
            </button>
          </div>
        ) : (
          rooms.map((room) => {
            const isChannel = room.type === 'CHANNEL';

            return (
              <div
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-[#E4EBE6] hover:border-[#D0DBD3] shadow-2xs transition-all cursor-pointer group space-y-3 active-press"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isChannel
                          ? 'bg-emerald-50 text-[#16A34A] border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isChannel ? (
                        <Globe className="w-5 h-5 stroke-[2.2]" />
                      ) : (
                        <Lock className="w-5 h-5 stroke-[2.2]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-bold text-[#17231D] group-hover:text-[#16A34A] transition-colors truncate">
                          {room.name}
                        </h4>

                        {isChannel ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                            <Globe className="w-3 h-3" />
                            <span>{language === 'ml' ? 'പൊതു ചാനൽ' : 'Public Channel'}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            <span>{language === 'ml' ? 'സ്വകാര്യ സംഘം' : 'Private Group'}</span>
                          </span>
                        )}
                      </div>

                      {room.description && (
                        <p className="text-xs text-[#718078] mt-1 line-clamp-2 leading-relaxed">
                          {room.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#718078] group-hover:text-[#16A34A] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-2" />
                </div>

                {/* Latest message preview */}
                {room.latestMessage && (
                  <div className="p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] text-xs flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-bold text-[#17231D] flex-shrink-0 text-[11px]">
                        {room.latestMessage.sender?.fullName || 'Member'}:
                      </span>
                      <span className="text-[#718078] truncate text-[11px]">
                        {room.latestMessage.content}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#94A39B] flex-shrink-0">
                      {new Date(room.latestMessage.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}

                {/* Footer metadata */}
                <div className="flex items-center justify-between pt-1 border-t border-[#E4EBE6]/60 text-xs text-[#718078]">
                  <div className="flex items-center gap-3">
                    {room.locality && (
                      <span className="flex items-center gap-1 text-[#16A34A] font-semibold">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{room.locality}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1 font-medium">
                      <Users className="w-3.5 h-3.5" />
                      <span>
                        {room.membersCount} {language === 'ml' ? 'അംഗങ്ങൾ' : 'members'}
                      </span>
                    </span>
                  </div>

                  <div>
                    {room.isMember ? (
                      <span className="text-[10px] font-bold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-2.5 py-0.5 rounded-full">
                        {language === 'ml' ? 'നിങ്ങൾ അംഗമാണ്' : 'Joined'}
                      </span>
                    ) : isChannel ? (
                      <span className="text-[10px] font-bold text-[#16A34A] hover:underline">
                        {language === 'ml' ? 'ചാനലിൽ പ്രവേശിക്കുക →' : 'Enter Channel →'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        {language === 'ml' ? 'ക്ഷണിച്ചാൽ മാത്രം' : 'Invite Only'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Discussion Modal */}
      <CreateDiscussionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={(newRoom) => {
          setRooms((prev) => [newRoom, ...prev]);
          setSelectedRoomId(newRoom.id);
        }}
      />
    </div>
  );
};

