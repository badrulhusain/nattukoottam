'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Layers,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { INITIAL_CONFLICTS_MOCK } from '../../lib/constants';
import { IssueStatus } from '../../types';

export const OfficialPortalView: React.FC = () => {
  const { language, posts } = useAppStore();
  const t = getT(language);
  const [selectedStatus, setSelectedStatus] = useState<Record<string, IssueStatus>>({});
  const [conflictResolved, setConflictResolved] = useState(false);

  const conflict = INITIAL_CONFLICTS_MOCK[0];
  const issues = posts.filter((p) => p.isInfrastructureIssue);

  const handleStatusChange = (postId: string, newStatus: IssueStatus) => {
    setSelectedStatus((prev) => ({ ...prev, [postId]: newStatus }));
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Official Government Coordination Banner */}
      <div className="bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#15803D] rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </span>
          <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200">
            Government of Kerala · LSGD & Interdepartmental Coordination
          </span>
        </div>
        <h2 className="text-lg font-bold">{t.official.title}</h2>
        <p className="text-xs text-emerald-100 opacity-90 mt-1 max-w-lg">
          Synchronizing Panchayat/PWD Roadworks & Kerala Water Authority (KWA) pipelines to prevent repeated road destruction.
        </p>
      </div>

      {/* Main Differentiator: Infrastructure Project Conflict Engine */}
      <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE6] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#17251D]">
                {t.coordination.conflictAlert}
              </h3>
              <p className="text-xs text-[#77847C]">{t.coordination.scenarioNotice}</p>
            </div>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
              conflictResolved
                ? 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9]'
                : 'bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            {conflictResolved ? 'SCHEDULES SYNCHRONIZED' : 'OVERLAP DETECTED'}
          </span>
        </div>

        {/* Project Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Project A: PWD / LSGD */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
              <Building2 className="w-4 h-4" />
              <span>Project A: Local Self Government (LSGD)</span>
            </div>
            <div className="text-xs font-semibold text-[#17251D]">{conflict.projectA.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#718078]">
              <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Planned: {conflict.projectA.startDate} to {conflict.projectA.endDate}</span>
            </div>
          </div>

          {/* Project B: KWA */}
          <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Building2 className="w-4 h-4" />
              <span>Project B: Kerala Water Authority (KWA)</span>
            </div>
            <div className="text-xs font-semibold text-[#17251D]">{conflict.projectB.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#718078]">
              <Calendar className="w-3.5 h-3.5 text-blue-700" />
              <span>Planned: {conflict.projectB.startDate} to {conflict.projectB.endDate}</span>
            </div>
          </div>
        </div>

        {/* Recommended Action Plan */}
        <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-[#17251D] leading-relaxed">
          <div className="font-bold text-amber-900 mb-1">{t.coordination.actionPlan}:</div>
          {conflict.recommendedAction}
        </div>

        {/* Action Button */}
        <div className="pt-1 flex justify-end">
          <button
            onClick={() => setConflictResolved(!conflictResolved)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active-press flex items-center gap-2 ${
              conflictResolved
                ? 'bg-white border border-[#E4EBE6] text-[#718078]'
                : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {conflictResolved
                ? 'Re-open Coordination'
                : language === 'ml'
                ? 'സമയക്രമം സമന്വയിപ്പിച്ചു അംഗീകരിക്കുക'
                : 'Acknowledge & Sync Schedules'}
            </span>
          </button>
        </div>
      </div>

      {/* Verified Citizen Grievances Queue */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#17251D]">
          {language === 'ml' ? 'വാർഡിലെ പരിഹാര ഘട്ടങ്ങൾ' : 'Department Resolution Pipeline'}
        </h3>

        <div className="space-y-3">
          {issues.map((issue) => {
            const currentStatus = selectedStatus[issue.id] || 'IN_PROGRESS';
            return (
              <div
                key={issue.id}
                className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#17251D]">{issue.author.fullName}</span>
                    <span className="text-[11px] text-[#718078] ml-2">
                      {issue.locality}, {issue.district}
                    </span>
                    <p className="text-xs text-[#17251D] mt-1 line-clamp-2">{issue.content}</p>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9] whitespace-nowrap">
                    {t.status[currentStatus as keyof typeof t.status] || currentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E4EBE6] text-xs">
                  <div className="text-[11px] text-[#718078]">
                    <span>{issue.supportsCount} citizens supported</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentStatus}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                      className="px-2 py-1 rounded-lg bg-white border border-[#E4EBE6] text-xs text-[#17251D] outline-none font-medium"
                    >
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="VERIFIED">Verified by Engineer</option>
                      <option value="IN_PROGRESS">Work in Progress</option>
                      <option value="RESOLVED">Resolved & Inspected</option>
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
