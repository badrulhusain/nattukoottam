'use client';

import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import {
  Bell,
  ChevronUp,
  MessageSquare,
  AlertTriangle,
  ShieldCheck,
  CheckCheck,
  CheckCircle2,
  RefreshCw,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { triggerEscalationScanApi } from '../../lib/api';

export const NotificationsView: React.FC = () => {
  const {
    language,
    notifications,
    unreadNotificationsCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useAppStore();
  const t = getT(language);

  const [filter, setFilter] = useState<'all' | 'escalated' | 'civic'>('all');
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRunEscalationScan = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await triggerEscalationScanApi();
      await fetchNotifications();
      if (res.escalatedCount > 0) {
        setScanMessage(
          language === 'ml'
            ? `${res.escalatedCount} പരാതികൾ വിജയകരമായി ഓട്ടോ-എസ്കലേഷൻ ചെയ്തു.`
            : `Auto-escalated ${res.escalatedCount} unattended civic complaints.`
        );
      } else {
        setScanMessage(
          language === 'ml'
            ? 'എല്ലാ പരാതികളും കൃത്യസമയത്ത് നടപടിയിലാണ്. പുതിയ എസ്കലേഷൻ ആവശ്യമില്ല.'
            : 'All complaints are on track. No new escalations required.'
        );
      }
    } catch {
      setScanMessage('Failed to trigger scan.');
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 4000);
    }
  };

  const getNotificationConfig = (type: string) => {
    switch (type) {
      case 'ISSUE_ESCALATED':
        return {
          icon: AlertTriangle,
          color: 'bg-amber-50 text-amber-600 border-amber-200',
          badgeText: language === 'ml' ? 'ഓട്ടോ-എസ്കലേഷൻ' : 'Auto-Escalated',
          badgeColor: 'bg-amber-100 text-amber-800',
        };
      case 'ISSUE_STATUS_UPDATED':
        return {
          icon: CheckCircle2,
          color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          badgeText: language === 'ml' ? 'സ്റ്റാറ്റസ് അപ്ഡേറ്റ്' : 'Status Update',
          badgeColor: 'bg-emerald-100 text-emerald-800',
        };
      case 'ISSUE_SUPPORTED':
        return {
          icon: ChevronUp,
          color: 'bg-sky-50 text-sky-600 border-sky-200',
          badgeText: language === 'ml' ? 'പിന്തുണ' : 'Support',
          badgeColor: 'bg-sky-100 text-sky-800',
        };
      case 'POST_COMMENTED':
        return {
          icon: MessageSquare,
          color: 'bg-purple-50 text-purple-600 border-purple-200',
          badgeText: language === 'ml' ? 'ചർച്ച' : 'Comment',
          badgeColor: 'bg-purple-100 text-purple-800',
        };
      default:
        return {
          icon: Bell,
          color: 'bg-[#EAF7EF] text-[#16A34A] border-[#D1EBD9]',
          badgeText: language === 'ml' ? 'അറിയിപ്പ്' : 'Update',
          badgeColor: 'bg-[#EAF7EF] text-[#16A34A]',
        };
    }
  };

  const filteredList = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'escalated') return n.type === 'ISSUE_ESCALATED';
    if (filter === 'civic') return n.type === 'ISSUE_STATUS_UPDATED' || n.type === 'ISSUE_SUPPORTED';
    return true;
  });

  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Just now';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return language === 'ml' ? 'ഇപ്പോൾ' : 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d`;
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Notifications Header */}
      <div className="bg-white rounded-2xl p-4 border border-[#E4EBE6] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-[#17231D] flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#16A34A]" />
            <span>{t.nav.notifications}</span>
            {unreadNotificationsCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[10px] font-extrabold">
                {unreadNotificationsCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-[#718078] mt-0.5">
            {language === 'ml'
              ? 'പരാതികളിലെ മാറ്റങ്ങളും ഓട്ടോ-എസ്കലേഷൻ അറിയിപ്പുകളും'
              : 'Status transitions, accountability escalations, and citizen supports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Run Escalation Audit Button */}
          <button
            onClick={handleRunEscalationScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Scan and escalate unattended issues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{language === 'ml' ? 'എസ്കലേഷൻ സ്കാൻ' : 'Run Audit'}</span>
          </button>

          {/* Mark All Read */}
          {unreadNotificationsCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4EBE6] text-xs font-semibold text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors active-press cursor-pointer"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="hidden sm:inline">
                {language === 'ml' ? 'എല്ലാം വായിച്ചതായി രേഖപ്പെടുത്തുക' : 'Mark all read'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Scan Result Feedback Toast */}
      {scanMessage && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs font-semibold text-amber-900 flex items-center gap-2 animate-in fade-in duration-200 shadow-2xs">
          <Flame className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press cursor-pointer ${
            filter === 'all'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          {language === 'ml' ? 'എല്ലാം' : 'All Updates'} ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('escalated')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press cursor-pointer flex items-center gap-1.5 ${
            filter === 'escalated'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>{language === 'ml' ? 'എസ്കലേഷൻ' : 'Escalations'}</span>
        </button>
        <button
          onClick={() => setFilter('civic')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active-press cursor-pointer ${
            filter === 'civic'
              ? 'bg-[#16A34A] text-white shadow-xs'
              : 'bg-white text-[#718078] hover:text-[#17231D] border border-[#E4EBE6]'
          }`}
        >
          {language === 'ml' ? 'സ്റ്റാറ്റസ് അപ്ഡേറ്റുകൾ' : 'Civic Actions'}
        </button>
      </div>

      {/* Notification Items List */}
      <div className="space-y-2.5">
        {filteredList.length > 0 ? (
          filteredList.map((item) => {
            const config = getNotificationConfig(item.type);
            const Icon = config.icon;
            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.isRead) {
                    markNotificationRead(item.id);
                  }
                }}
                className={`p-4 bg-white rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer hover:border-[#D0DBD3] ${
                  !item.isRead
                    ? 'border-amber-200 bg-gradient-to-r from-white to-amber-50/20 shadow-2xs'
                    : 'border-[#E4EBE6]'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl border flex-shrink-0 mt-0.5 ${config.color}`}
                >
                  <Icon className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${config.badgeColor}`}
                      >
                        {config.badgeText}
                      </span>
                      <h4 className="text-xs font-bold text-[#17231D] truncate">
                        {item.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-[10px] text-[#718078]">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#526359] leading-relaxed">
                    {item.message}
                  </p>
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
                {language === 'ml' ? 'അറിയിപ്പുകൾ ഒന്നുമില്ല' : 'No notifications found'}
              </h4>
              <p className="text-xs text-[#718078] mt-1 max-w-xs mx-auto">
                {language === 'ml'
                  ? 'നിങ്ങൾ പിന്തുണച്ച പരാതികളിലോ വാർഡിലെ ഇടപെടലുകളിലോ മാറ്റങ്ങൾ ഉണ്ടാകുമ്പോൾ ഇവിടെ കാണാം.'
                  : 'You will receive real-time alerts when issues escalate or departments update civic records.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsView;
