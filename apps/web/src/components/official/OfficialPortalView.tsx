'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Clock, MapPin, Building2, Calendar, FileText } from 'lucide-react';
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
    <div className="space-y-5 pb-16">
      {/* Official Banner */}
      <div className="bg-gradient-to-r from-[#064B2E] to-[#087A45] rounded-3xl p-5 text-white shadow-md flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-200">
              Government Coordination Wing
            </span>
          </div>
          <h2 className="text-lg font-bold">{t.official.title}</h2>
          <p className="text-xs text-emerald-100 opacity-90">
            Panchayat / LSGD & Kerala Water Authority (KWA) Joint Action Console
          </p>
        </div>
      </div>

      {/* Main Differentiator: Infrastructure Project Coordination & Conflict Engine */}
      <div className="bg-white rounded-3xl p-5 border border-amber-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 rounded-xl text-amber-800">
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
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              conflictResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {conflictResolved ? 'COORDINATED & RESOLVED' : 'ACTIVE CONFLICT'}
          </span>
        </div>

        {/* Project Comparison Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Project A: PWD / Panchayat */}
          <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#087A45]">
              <Building2 className="w-4 h-4" />
              <span>Project A: Local Self Government (LSGD)</span>
            </div>
            <div className="text-xs font-semibold text-[#17251D]">{conflict.projectA.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#77847C]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Planned: {conflict.projectA.startDate} to {conflict.projectA.endDate}</span>
            </div>
          </div>

          {/* Project B: KWA */}
          <div className="p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
              <Building2 className="w-4 h-4" />
              <span>Project B: Kerala Water Authority (KWA)</span>
            </div>
            <div className="text-xs font-semibold text-[#17251D]">{conflict.projectB.name}</div>
            <div className="flex items-center gap-1 text-[11px] text-[#77847C]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Planned: {conflict.projectB.startDate} to {conflict.projectB.endDate}</span>
            </div>
          </div>
        </div>

        {/* Recommended Action Plan */}
        <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 text-xs text-[#17251D] leading-relaxed">
          <div className="font-semibold text-amber-900 mb-1">{t.coordination.actionPlan}:</div>
          {conflict.recommendedAction}
        </div>

        {/* Coordination Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => setConflictResolved(!conflictResolved)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              conflictResolved
                ? 'bg-[#E9F8ED] text-[#087A45]'
                : 'bg-[#087A45] text-white hover:bg-[#064B2E] shadow-sm'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{conflictResolved ? 'Schedules Synchronized' : t.coordination.markResolved}</span>
          </button>
        </div>
      </div>

      {/* Assigned Civic Issues Review */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-[#17251D] px-1 flex items-center justify-between">
          <span>{t.official.assignedIssues} ({issues.length})</span>
          <span className="text-xs text-[#77847C] font-normal">Kakkanad Ward 14</span>
        </h3>

        <div className="space-y-3">
          {issues.map((issue) => {
            const currentStatus = selectedStatus[issue.id] || 'IN_PROGRESS';

            return (
              <div key={issue.id} className="bg-white rounded-3xl p-4 border border-[#E6EEE8] shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#17251D]">{issue.content.substring(0, 70)}...</h4>
                    <div className="flex items-center gap-2 text-xs text-[#77847C] mt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#087A45]" />
                      <span>{issue.locality}</span>
                      <span>·</span>
                      <span>{issue.supportsCount} {t.feed.supports}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {t.status[currentStatus as keyof typeof t.status] || currentStatus}
                  </span>
                </div>

                {/* Status Update Control */}
                <div className="pt-2 border-t border-[#E6EEE8] flex items-center justify-between gap-2">
                  <span className="text-xs text-[#77847C] font-medium">{t.official.updateStatus}:</span>
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(issue.id, e.target.value as IssueStatus)}
                    className="p-1.5 rounded-xl border border-[#E6EEE8] bg-[#F7FAF7] text-xs font-semibold text-[#087A45] outline-none cursor-pointer"
                  >
                    <option value="VERIFIED">{t.status.VERIFIED}</option>
                    <option value="ASSIGNED">{t.status.ASSIGNED}</option>
                    <option value="IN_PROGRESS">{t.status.IN_PROGRESS}</option>
                    <option value="WAITING_FOR_COORDINATION">{t.status.WAITING_FOR_COORDINATION}</option>
                    <option value="RESOLVED">{t.status.RESOLVED}</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

