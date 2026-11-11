'use client';

import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Loader2,
  Check,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import {
  fetchLiveConflicts,
  fetchLiveProjects,
  updateProjectStatusApi,
  resolveConflictApi,
  updateIssueStatusApi,
} from '../../lib/api';
import { IssueStatus } from '../../types';

export const OfficialPortalView: React.FC = () => {
  const { language, posts, setPosts, currentLocality } = useAppStore();
  const t = getT(language);

  const [conflict, setConflict] = useState<any>(null);
  const [conflictResolved, setConflictResolved] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);

  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Load Conflicts and Projects from backend DB
  const loadData = async () => {
    try {
      setLoadingProjects(true);
      const [conflictsData, projectsData] = await Promise.all([
        fetchLiveConflicts(currentLocality),
        fetchLiveProjects(currentLocality),
      ]);

      if (conflictsData && Array.isArray(conflictsData) && conflictsData.length > 0) {
        const first = conflictsData[0];
        setConflict({
          id: first.id,
          title: `${first.projectA?.department?.name || 'PWD'} vs. ${first.projectB?.department?.name || 'KWA'} Overlap`,
          projectA: first.projectA || {
            name: 'Local Self Government (LSGD) Road Works',
            startDate: 'TBD',
            endDate: 'TBD',
          },
          projectB: first.projectB || {
            name: 'Kerala Water Authority (KWA) Pipeline Works',
            startDate: 'TBD',
            endDate: 'TBD',
          },
          recommendedAction:
            first.jointPlan || first.notes || 'Postpone road resurfacing until underground pipeline excavation completes.',
          status: first.status,
        });
        setConflictResolved(first.status === 'RESOLVED');
      } else {
        setConflict(null);
      }

      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (err) {
      console.error('Error loading official portal data:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentLocality]);

  const issues = posts.filter((p) => p.isInfrastructureIssue);

  // Handle Civic Grievance Status Change in Database
  const handleIssueStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingIssueId(issueId);
    try {
      await updateIssueStatusApi(issueId, newStatus);

      // Update store state immediately
      setPosts(
        posts.map((p) => (p.id === issueId ? { ...p, status: newStatus } : p))
      );

      showToast(
        language === 'ml'
          ? 'പരാതിയുടെ അവസ്ഥ വിജയകരമായി പുതുക്കി (DB Saved)'
          : 'Grievance status updated and saved to DB'
      );
    } catch (err: any) {
      console.error('Failed to update issue status:', err);
      alert(err.message || 'Failed to update grievance status in database');
    } finally {
      setUpdatingIssueId(null);
    }
  };

  // Handle Infrastructure Project Status Change in Database
  const handleProjectStatusChange = async (projectId: string, newStatus: string) => {
    setUpdatingProjectId(projectId);
    try {
      await updateProjectStatusApi(projectId, newStatus);

      setProjects((prev) =>
        prev.map((proj) =>
          proj.id === projectId ? { ...proj, status: newStatus } : proj
        )
      );

      showToast(
        language === 'ml'
          ? 'പദ്ധതിയുടെ അവസ്ഥ പുതുക്കി (DB Saved)'
          : 'Project status updated and saved to DB'
      );
    } catch (err: any) {
      console.error('Failed to update project status:', err);
      alert(err.message || 'Failed to update project status');
    } finally {
      setUpdatingProjectId(null);
    }
  };

  // Handle Conflict Resolution Toggle in Database
  const handleToggleConflictResolution = async () => {
    if (!conflict) return;
    setIsResolvingConflict(true);
    const nextStatus = conflictResolved ? 'POTENTIAL' : 'RESOLVED';
    try {
      await resolveConflictApi(
        conflict.id,
        nextStatus,
        'Joint schedule synchronized: PWD resurfacing coordinated with KWA pipeline laying.'
      );
      setConflictResolved(!conflictResolved);
      showToast(
        nextStatus === 'RESOLVED'
          ? (language === 'ml' ? 'സമയക്രമം സമന്വയിപ്പിച്ചു (Saved)' : 'Schedules synchronized and saved')
          : (language === 'ml' ? 'വൈരുദ്ധ്യം വീണ്ടും തുറന്നു' : 'Conflict re-opened')
      );
    } catch (err: any) {
      console.error('Failed to resolve conflict:', err);
      alert(err.message || 'Failed to update coordination status');
    } finally {
      setIsResolvingConflict(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-16 right-4 z-50 bg-[#14532D] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#22C55E]/40 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Official Government Coordination Banner */}
      <div className="bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#15803D] rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200">
              Government of Kerala · LSGD & Interdepartmental Coordination
            </span>
          </div>
          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white active-press"
            title="Refresh portal"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingProjects ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <h2 className="text-lg font-bold">{t.official.title}</h2>
        <p className="text-xs text-emerald-100 opacity-90 mt-1 max-w-lg">
          Synchronizing Panchayat/PWD Roadworks & Kerala Water Authority (KWA) pipelines to prevent repeated road destruction.
        </p>
      </div>

      {/* Main Differentiator: Infrastructure Project Conflict Engine */}
      {conflict ? (
        <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE6] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#17231D]">
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
            {/* Project A */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                <Building2 className="w-4 h-4" />
                <span>Project A: Local Self Government (LSGD)</span>
              </div>
              <div className="text-xs font-semibold text-[#17231D]">{conflict.projectA?.name}</div>
              <div className="flex items-center gap-1 text-[11px] text-[#718078]">
                <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>
                  Planned: {conflict.projectA?.startDate ? new Date(conflict.projectA.startDate).toLocaleDateString() : 'TBD'} to {conflict.projectA?.expectedEndDate ? new Date(conflict.projectA.expectedEndDate).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>

            {/* Project B */}
            <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                <Building2 className="w-4 h-4" />
                <span>Project B: Kerala Water Authority (KWA)</span>
              </div>
              <div className="text-xs font-semibold text-[#17231D]">{conflict.projectB?.name}</div>
              <div className="flex items-center gap-1 text-[11px] text-[#718078]">
                <Calendar className="w-3.5 h-3.5 text-blue-700" />
                <span>
                  Planned: {conflict.projectB?.startDate ? new Date(conflict.projectB.startDate).toLocaleDateString() : 'TBD'} to {conflict.projectB?.expectedEndDate ? new Date(conflict.projectB.expectedEndDate).toLocaleDateString() : 'TBD'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommended Action Plan */}
          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs text-[#17231D] leading-relaxed">
            <div className="font-bold text-amber-900 mb-1">{t.coordination.actionPlan}:</div>
            {conflict.recommendedAction}
          </div>

          {/* Action Button */}
          <div className="pt-1 flex justify-end">
            <button
              onClick={handleToggleConflictResolution}
              disabled={isResolvingConflict}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active-press flex items-center gap-2 cursor-pointer ${
                conflictResolved
                  ? 'bg-white border border-[#E4EBE6] text-[#718078] hover:bg-zinc-50'
                  : 'bg-[#16A34A] hover:bg-[#15803D] text-white shadow-xs'
              }`}
            >
              {isResolvingConflict ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>
                {conflictResolved
                  ? (language === 'ml' ? 'സമന്വയം പുനഃപരിശോധിക്കുക' : 'Re-open Coordination')
                  : language === 'ml'
                  ? 'സമയക്രമം സമന്വയിപ്പിച്ചു അംഗീകരിക്കുക'
                  : 'Acknowledge & Sync Schedules'}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-6 border border-[#E4EBE6] shadow-2xs flex items-center gap-3.5">
          <div className="p-3 bg-[#EAF7EF] text-[#16A34A] rounded-2xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#17231D]">
              {language === 'ml' ? 'വകുപ്പ് പദ്ധതികൾ സമന്വയിപ്പിച്ചിരിക്കുന്നു' : 'Department Projects Synchronized'}
            </h3>
            <p className="text-xs text-[#718078] mt-0.5">
              {language === 'ml'
                ? `${currentLocality} വാർഡിൽ നിലവിൽ റോഡ് പണി-പൈപ്പ് ലൈൻ വൈരുദ്ധ്യങ്ങൾ ഒന്നും കണ്ടെത്തിയിട്ടില്ല.`
                : `No active infrastructure clashes detected in ${currentLocality}.`}
            </p>
          </div>
        </div>
      )}

      {/* Infrastructure Projects Status Management */}
      {projects.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#EAF7EF] text-[#16A34A]">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#17231D]">
                  {language === 'ml' ? 'വകുപ്പ് അടിസ്ഥാനസൗകര്യ പദ്ധതികൾ' : 'Department Infrastructure Projects'}
                </h3>
                <p className="text-[11px] text-[#718078]">
                  {language === 'ml' ? 'പദ്ധതികളുടെ നിർമ്മാണ പുരോഗതി രേഖപ്പെടുത്തുക' : 'Update live project execution status'}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#16A34A] bg-[#EAF7EF] px-2.5 py-1 rounded-md">
              {projects.length} {language === 'ml' ? 'പദ്ധതികൾ' : 'Projects'}
            </span>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => {
              const isUpdating = updatingProjectId === proj.id;
              return (
                <div
                  key={proj.id}
                  className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#EAF7EF] px-2 py-0.5 rounded-md">
                        {proj.department?.name || 'Department Project'}
                      </span>
                      <h4 className="text-xs font-bold text-[#17231D]">{proj.name}</h4>
                      <p className="text-[11px] text-[#718078] line-clamp-2">{proj.description}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        proj.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : proj.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {proj.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4EBE6] text-xs">
                    <div className="text-[11px] text-[#718078] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#16A34A]" />
                      <span>{proj.locality}, {proj.district}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />}
                      <select
                        value={proj.status}
                        disabled={isUpdating}
                        onChange={(e) => handleProjectStatusChange(proj.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EBE6] text-xs font-bold text-[#17231D] outline-none cursor-pointer hover:border-[#16A34A] transition-colors"
                      >
                        <option value="PLANNED">Planned</option>
                        <option value="APPROVED">Approved</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="ON_HOLD">On Hold</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verified Citizen Grievances Queue */}
      <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231D]">
              {language === 'ml' ? 'വാർഡിലെ പരിഹാര ഘട്ടങ്ങൾ' : 'Department Resolution Pipeline'}
            </h3>
            <p className="text-[11px] text-[#718078]">
              {language === 'ml' ? 'പൗരന്മാരുടെ പരാതികളുടെ നിലവിലുള്ള പുരോഗതി മാറ്റുക' : 'Update civic complaint progress'}
            </p>
          </div>
          <span className="text-xs font-bold text-[#16A34A] bg-[#EAF7EF] px-2.5 py-1 rounded-md">
            {issues.length} {language === 'ml' ? 'പരാതികൾ' : 'Grievances'}
          </span>
        </div>

        <div className="space-y-3">
          {issues.length > 0 ? (
            issues.map((issue) => {
              const currentStatus = (issue as any).status || 'UNDER_REVIEW';
              const isUpdating = updatingIssueId === issue.id;

              return (
                <div
                  key={issue.id}
                  className="p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-[#17231D]">{issue.author.fullName}</span>
                      <span className="text-[11px] text-[#718078] ml-2">
                        {issue.locality}, {issue.district}
                      </span>
                      <p className="text-xs text-[#17231D] mt-1 line-clamp-2">{issue.content}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                        currentStatus === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentStatus === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.status[currentStatus as keyof typeof t.status] || currentStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E4EBE6] text-xs">
                    <div className="text-[11px] text-[#718078]">
                      <span>{issue.supportsCount} citizens supported</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />}
                      <select
                        value={currentStatus}
                        disabled={isUpdating}
                        onChange={(e) => handleIssueStatusChange(issue.id, e.target.value as IssueStatus)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EBE6] text-xs font-bold text-[#17231D] outline-none cursor-pointer hover:border-[#16A34A] transition-colors"
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
            })
          ) : (
            <div className="p-8 text-center text-xs text-[#718078] bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
              {language === 'ml'
                ? 'ഈ പ്രദേശത്ത് നിലവിൽ തീർപ്പാക്കാനുള്ള പരാതികൾ ലഭ്യമല്ല.'
                : 'No active infrastructure grievances reported in this jurisdiction.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
