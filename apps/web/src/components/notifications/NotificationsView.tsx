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

  const notifications = [
    {
      id: '1',
      type: 'civic',
      title:
        language === 'ml'
          ? 'നിങ്ങളുടെ പരാതിക്ക് 14 പുതിയ പിന്തുണകൾ'
          : '14 new neighbors marked "I Face This Too"',
      message:
        'Infopark Expressway road potholes grievance reached 634 citizen supports.',
      time: '10m ago',
      isUnread: true,
      icon: ChevronUp,
      color: 'bg-[#EAF7EF] text-[#16A34A] border-[#D1EBD9]',
    },
    {
      id: '2',
      type: 'conflicts',
      title:
        language === 'ml'
          ? 'പദ്ധതി വൈരുദ്ധ്യ മുന്നറിയിപ്പ്'
          : 'Project Coordination Alert (Kakkanad Ward 12)',
      message:
        'LSGD Road resurfacing overlaps with KWA underground feeder pipeline excavation.',
      time: '1h ago',
      isUnread: true,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    {
      id: '3',
      type: 'civic',
      title:
        language === 'ml'
          ? 'വകുപ്പ് ഉദ്യോഗസ്ഥൻ സ്ഥിരീകരിച്ചു'
          : 'Official Action Update: Kerala Water Authority',
      message:
        'Assistant Engineer (KWA) verified the pipeline leakage report in Perinthalmanna. Work scheduled for Nov 14.',
      time: '3h ago',
      isUnread: false,
      icon: ShieldCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      id: '4',
      type: 'civic',
      title:
        language === 'ml'
          ? 'പുതിയ ചർച്ചാ മറുപടി'
          : 'Discussion Reply from Vishnu Narayanan',
      message:
        'Vishnu replied: "KSEB sub-station team has cordoned off the sagging line."',
      time: '5h ago',
      isUnread: false,
      icon: MessageSquare,
      color: 'bg-[#F8FAF8] text-[#718078] border-[#E4EBE6]',
    },
  ];

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
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#EAF7EF] text-[#16A34A] rounded-xl border border-[#D1EBD9]">
            <Bell className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#17251D]">{t.nav.notifications}</h2>
            <p className="text-xs text-[#718078]">
              {language === 'ml' ? 'വാർഡ് അപ്‌ഡേറ്റുകളും അറിയിപ്പുകളും' : 'Locality updates & civic alerts'}
            </p>
          </div>
        </div>

        <button className="flex items-center gap-1 text-xs text-[#16A34A] font-bold hover:text-[#15803D] transition-colors">
          <CheckCheck className="w-3.5 h-3.5" />
          <span>{language === 'ml' ? 'വായിച്ചതായി അടയാളപ്പെടുത്തുക' : 'Mark all read'}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press ${
            filter === 'all'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          All
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
        {filteredList.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`p-4 bg-white rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer hover:border-[#D0DBD3] ${
                item.isUnread ? 'border-[#D1EBD9] bg-gradient-to-r from-white to-[#EAF7EF]/20' : 'border-[#E4EBE6]'
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${item.color}`}
              >
                <Icon className="w-4 h-4 stroke-[2.2]" />
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-[#17251D] truncate">{item.title}</h4>
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
        })}
      </div>
    </div>
  );
};
