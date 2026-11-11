'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import {
  Bell,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  CheckCheck,
  Filter,
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { language } = useAppStore();
  const t = getT(language);
  const [filter, setFilter] = useState<'all' | 'civic' | 'conflicts'>('all');

  const notifications: any[] = [];

  const filteredList = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'civic') return n.type === 'civic';
    if (filter === 'conflicts') return n.type === 'conflicts';
    return true;
  });

  return (
    <div className="space-y-4 pb-20">
      {/* Notifications Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4EBE6] shadow-2xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#17231D] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#16A34A]" />
            <span>{t.nav.notifications}</span>
          </h2>
          <p className="text-xs text-[#718078] mt-0.5">
            {language === 'ml'
              ? 'നിങ്ങൾ പിന്തുണച്ച റിപ്പോർട്ടുകളിലെ പുതിയ വിവരങ്ങൾ'
              : 'Updates on your reports and watched civic issues'}
          </p>
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4EBE6] text-xs font-semibold text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors active-press"
          title="Mark all as read"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" />
          <span className="hidden sm:inline">
            {language === 'ml' ? 'വായിച്ചതായി രേഖപ്പെടുത്തുക' : 'Mark all read'}
          </span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
            filter === 'all'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          All Updates
        </button>
        <button
          onClick={() => setFilter('civic')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
            filter === 'civic'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          Civic Actions
        </button>
        <button
          onClick={() => setFilter('conflicts')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
            filter === 'conflicts'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          Department Alerts
        </button>
      </div>

      {/* Notification Items */}
      <div className="space-y-2.5">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`p-4 bg-white rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer hover:border-[#D0DBD3] ${
                  item.isUnread
                    ? 'border-[#D1EBD9] bg-gradient-to-r from-white to-[#EAF7EF]/20'
                    : 'border-[#E4EBE6]'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${item.color}`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-[#17231D] truncate">{item.title}</h4>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-[#718078]">{item.time}</span>
                      {item.isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[#16A34A]" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#718078] leading-relaxed">{item.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white rounded-2xl p-10 text-center border border-[#E4EBE6] shadow-2xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EAF7EF] text-[#16A34A] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#17231D]">
                {language === 'ml' ? 'അറിയിപ്പുകൾ ഒന്നുമില്ല' : 'No notifications yet'}
              </h4>
              <p className="text-xs text-[#718078] mt-1 max-w-xs mx-auto">
                {language === 'ml'
                  ? 'നിങ്ങൾ പിന്തുണച്ച പരാതികളിലോ വാർഡിലെ ഇടപെടലുകളിലോ മാറ്റങ്ങൾ ഉണ്ടാകുമ്പോൾ ഇവിടെ കാണാം.'
                  : 'You will receive real-time updates when authorities or neighbors interact with your civic reports.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
