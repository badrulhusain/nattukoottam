'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { Bell, ChevronUp, MessageSquare, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { language } = useAppStore();
  const t = getT(language);

  const notifications = [
    {
      id: '1',
      title: language === 'ml' ? 'നിങ്ങളുടെ പരാതിക്ക് പുതിയ പിന്തുണ' : 'New support on your report',
      message: '14 residents in Kakkanad marked "I Face This Too" on Infopark road potholes.',
      time: '10m ago',
      icon: ChevronUp,
      color: 'bg-emerald-100 text-[#087A45]',
    },
    {
      id: '2',
      title: language === 'ml' ? 'പദ്ധതി വൈരുദ്ധ്യ മുന്നറിയിപ്പ്' : 'Project Conflict Detected',
      message: 'PWD Road resurfacing overlaps with KWA pipeline digging near Infopark Junction.',
      time: '1h ago',
      icon: AlertTriangle,
      color: 'bg-amber-100 text-amber-800',
    },
    {
      id: '3',
      title: language === 'ml' ? 'വകുപ്പ് ഉദ്യോഗസ്ഥൻ സ്ഥിരീകരിച്ചു' : 'Official Verification',
      message: 'Assistant Engineer (KWA) verified the pipeline leakage report in Perinthalmanna.',
      time: '3h ago',
      icon: ShieldCheck,
      color: 'bg-blue-100 text-blue-700',
    },
  ];

  return (
    <div className="space-y-4 pb-16">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-lg font-bold text-[#17251D] flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#087A45]" />
          <span>{t.nav.notifications}</span>
        </h2>
        <button className="text-xs text-[#087A45] font-semibold hover:underline">
          {language === 'ml' ? 'എല്ലാം വായിച്ചതായി അടയാളപ്പെടുത്തുക' : 'Mark all as read'}
        </button>
      </div>

      <div className="space-y-2.5">
        {notifications.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="p-4 bg-white rounded-3xl border border-[#E6EEE8] shadow-2xs hover:border-[#32C878]/40 transition-colors flex items-start gap-3.5 cursor-pointer"
            >
              <span className={`p-2.5 rounded-2xl ${item.color} flex-shrink-0 mt-0.5`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#17251D]">{item.title}</h4>
                  <span className="text-[10px] text-[#77847C]">{item.time}</span>
                </div>
                <p className="text-xs text-[#77847C] leading-relaxed">{item.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

