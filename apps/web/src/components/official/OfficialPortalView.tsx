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
  Plus,
  Filter,
  DollarSign,
  UserCheck,
  HardHat,
  History,
  Activity,
  MessageSquare,
  AlertCircle,
  Wrench,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import {
  fetchLiveConflicts,
  fetchLiveProjects,
  fetchLiveIssues,
  fetchLiveDepartments,
  updateProjectStatusApi,
  resolveConflictApi,
  updateIssueStatusApi,
} from '../../lib/api';
import { IssueStatus } from '../../types';
import { ProjectRegistryModal } from './ProjectRegistryModal';
import { IssueResolutionModal } from './IssueResolutionModal';

export const OfficialPortalView: React.FC = () => {
  const { language, currentLocality, posts, setPosts } = useAppStore();
  const t = getT(language);
  const isMl = language === 'ml';

  // Active Department Persona Filter
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [departments, setDepartments] = useState<any[]>([]);

  // Active Tab: 'pipeline' (Grievances) | 'projects' (Registry) | 'history' (Excavation Log)
  const [activeTab, setActiveTab] = useState<'pipeline' | 'projects' | 'history'>('pipeline');

  // Conflict Engine
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [editingJointPlan, setEditingJointPlan] = useState<string>('');
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

  // Projects Registry
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  // Civic Grievances Pipeline
  const [issues, setIssues] = useState<any[]>([]);
  const [updatingIssueId, setUpdatingIssueId] = useState<string | null>(null);
  const [selectedIssueForModal, setSelectedIssueForModal] = useState<any | null>(null);
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);

  // Status Filter for grievances
  const [grievanceStatusFilter, setGrievanceStatusFilter] = useState<string>('all');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Departments, Conflicts, Projects, and Issues
  const loadAllData = async () => {
    try {
      setLoadingData(true);
      const [deptsData, conflictsData, projectsData, issuesData] = await Promise.all([
        fetchLiveDepartments(),
        fetchLiveConflicts(),
        fetchLiveProjects(),
        fetchLiveIssues(),
      ]);

      if (Array.isArray(deptsData) && deptsData.length > 0) {
        setDepartments(deptsData);
      }

      if (Array.isArray(conflictsData)) {
        setConflicts(conflictsData);
        if (conflictsData.length > 0 && !editingJointPlan) {
          setEditingJointPlan(
            conflictsData[0].jointPlan ||
              'Coordinate schedules: Complete underground utility excavation before asphalt resurfacing begins.'
          );
        }
      }

      if (Array.isArray(projectsData)) {
        setProjects(projectsData);
      }

      if (Array.isArray(issuesData)) {
        setIssues(issuesData);
      }
    } catch (err) {
      console.error('Error loading official portal data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentLocality]);

  // Filtered lists based on active department persona
  const filteredProjects = projects.filter((p) => {
    if (selectedDeptId === 'all') return true;
    return p.departmentId === selectedDeptId || p.department?.id === selectedDeptId;
  });

  const activeProjects = filteredProjects.filter((p) => p.status !== 'COMPLETED' && p.status !== 'CANCELLED');
  const completedProjects = filteredProjects.filter((p) => p.status === 'COMPLETED');

  const filteredIssues = issues.filter((issue) => {
    const matchesDept =
      selectedDeptId === 'all' ||
      issue.assignedDeptId === selectedDeptId ||
      issue.department?.id === selectedDeptId ||
      (selectedDeptId === 'dept_pwd_01' && issue.category === 'ROAD_TRANSPORT') ||
      (selectedDeptId === 'dept_kwa_01' && issue.category === 'WATER_SUPPLY') ||
      (selectedDeptId === 'dept_kseb_01' && issue.category === 'ELECTRICITY') ||
      (selectedDeptId === 'dept_waste_01' && issue.category === 'WASTE_MANAGEMENT') ||
      (selectedDeptId === 'dept_lsgd_01' && ['DRAINAGE', 'PUBLIC_SAFETY', 'OTHER'].includes(issue.category));

    const matchesStatus = grievanceStatusFilter === 'all' || issue.status === grievanceStatusFilter;
    return matchesDept && matchesStatus;
  });

  // Handle Infrastructure Project Status Change in DB
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
        isMl ? 'പദ്ധതിയുടെ അവസ്ഥ പുതുക്കി (DB Saved)' : 'Project status updated & saved to DB'
      );
    } catch (err: any) {
      console.error('Failed to update project status:', err);
      alert(err.message || 'Failed to update project status');
    } finally {
      setUpdatingProjectId(null);
    }
  };

  // Handle Civic Grievance Quick Status Change in DB
  const handleIssueStatusChange = async (issueId: string, newStatus: IssueStatus) => {
    setUpdatingIssueId(issueId);
    try {
      await updateIssueStatusApi(issueId, newStatus);

      // Update local issues state
      setIssues((prev) =>
        prev.map((iss) => (iss.id === issueId ? { ...iss, status: newStatus } : iss))
      );

      // Sync with global store posts
      setPosts(
        posts.map((p) => (p.id === issueId ? { ...p, status: newStatus } : p))
      );

      showToast(
        isMl ? 'പരാതിയുടെ അവസ്ഥ വിജയകരമായി പുതുക്കി (DB Saved)' : 'Grievance status updated & saved to DB'
      );
    } catch (err: any) {
      console.error('Failed to update issue status:', err);
      alert(err.message || 'Failed to update grievance status in database');
    } finally {
      setUpdatingIssueId(null);
    }
  };

  // Handle Conflict Resolution Toggle in DB
  const handleToggleConflictResolution = async (conflictId: string, currentStatus: string) => {
    setIsResolvingConflict(true);
    const nextStatus = currentStatus === 'RESOLVED' ? 'POTENTIAL' : 'RESOLVED';
    try {
      await resolveConflictApi(conflictId, nextStatus, editingJointPlan);
      setConflicts((prev) =>
        prev.map((c) =>
          c.id === conflictId
            ? { ...c, status: nextStatus, jointPlan: editingJointPlan }
            : c
        )
      );
      showToast(
        nextStatus === 'RESOLVED'
          ? (isMl ? 'സമയക്രമം സമന്വയിപ്പിച്ചു അംഗീകരിച്ചു (Saved)' : 'Schedules synchronized and saved to DB')
          : (isMl ? 'വൈരുദ്ധ്യം വീണ്ടും തുറന്നു' : 'Conflict re-opened for review')
      );
    } catch (err: any) {
      console.error('Failed to update conflict resolution:', err);
      alert(err.message || 'Failed to update conflict');
    } finally {
      setIsResolvingConflict(false);
    }
  };

  // Current Official Designation Label
  const getOfficialPersonaLabel = () => {
    switch (selectedDeptId) {
      case 'dept_pwd_01':
        return isMl
          ? 'പൊതുമരാമത്ത് വകുപ്പ് (PWD) · എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർ'
          : 'Public Works Dept (PWD) · Executive Engineer';
      case 'dept_kwa_01':
        return isMl
          ? 'കേരള വാട്ടർ അതോറിറ്റി (KWA) · അസിസ്റ്റന്റ് എക്സിക്യൂട്ടീവ് എഞ്ചിനീയർ'
          : 'Kerala Water Authority (KWA) · Assistant Executive Engineer';
      case 'dept_kseb_01':
        return isMl
          ? 'വൈദ്യുതി ബോർഡ് (KSEB) · സബ് ഡിവിഷൻ അസിസ്റ്റന്റ് എഞ്ചിനീയർ'
          : 'Electricity Board (KSEB) · Sub-division Officer';
      case 'dept_lsgd_01':
        return isMl
          ? 'തദ്ദേശ സ്വയംഭരണ വകുപ്പ് (LSGD) · പഞ്ചായത്ത് സെക്രട്ടറി / എഞ്ചിനീയർ'
          : 'Local Self Govt (LSGD) · Panchayat Secretary / Engineer';
      case 'dept_waste_01':
        return isMl
          ? 'ക്ലീൻ കേരള / ശുചിത്വ മിഷൻ · മാലിന്യ സംസ്കരണ സൂപ്പർവൈസർ'
          : 'Clean Kerala / Suchitwa Mission · Sanitation Supervisor';
      default:
        return isMl
          ? 'കേരള സർക്കാർ · തദ്ദേശ-വകുപ്പ് തല സംയുക്ത ഏകോപന പോർട്ടൽ'
          : 'Government of Kerala · LSGD Joint Interdepartmental Portal';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 bg-[#14532D] text-white px-4 py-2.5 rounded-xl shadow-lg border border-[#22C55E]/40 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Official Portal Header Banner */}
      <div className="bg-gradient-to-br from-[#14532D] via-[#16A34A] to-[#15803D] rounded-2xl p-5 text-white shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-200">
              Government of Kerala · Official Administration
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-white text-[#14532D] hover:bg-emerald-50 text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active-press"
            >
              <Plus className="w-4 h-4" />
              <span>{isMl ? 'പദ്ധതി രജിസ്റ്റർ ചെയ്യുക' : 'Register Project'}</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white active-press cursor-pointer"
              title="Refresh portal"
            >
              <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">{t.official.title}</h2>
          <p className="text-xs text-emerald-100 opacity-90 mt-0.5">
            {getOfficialPersonaLabel()}
          </p>
        </div>

        {/* Department Switcher Pills */}
        <div className="pt-1 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-white text-[#14532D] shadow-xs'
                : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isMl ? 'എല്ലാ വകുപ്പുകളും (All)' : 'All Departments'}
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDeptId(dept.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedDeptId === dept.id
                  ? 'bg-white text-[#14532D] shadow-xs'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {dept.code || dept.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-xl border border-[#E4EBE6] shadow-2xs">
          <div className="flex items-center justify-between text-[#718078] mb-1">
            <span className="text-[11px] font-semibold">{isMl ? 'പദ്ധതികൾ' : 'Active Projects'}</span>
            <Building2 className="w-3.5 h-3.5 text-[#16A34A]" />
          </div>
          <div className="text-lg font-bold text-[#17231D]">{activeProjects.length}</div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4EBE6] shadow-2xs">
          <div className="flex items-center justify-between text-[#718078] mb-1">
            <span className="text-[11px] font-semibold">{isMl ? 'വൈരുദ്ധ്യങ്ങൾ' : 'Overlap Clashes'}</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-lg font-bold text-amber-700">
            {conflicts.filter((c) => c.status !== 'RESOLVED').length}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4EBE6] shadow-2xs">
          <div className="flex items-center justify-between text-[#718078] mb-1">
            <span className="text-[11px] font-semibold">{isMl ? 'തീർപ്പാക്കാനുള്ളവ' : 'Pending Grievances'}</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-lg font-bold text-[#17231D]">
            {filteredIssues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED').length}
          </div>
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#E4EBE6] shadow-2xs">
          <div className="flex items-center justify-between text-[#718078] mb-1">
            <span className="text-[11px] font-semibold">{isMl ? 'പരിഹരിച്ചവ' : 'Resolved'}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg font-bold text-emerald-700">
            {filteredIssues.filter((i) => i.status === 'RESOLVED').length}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-[#E4EBE6] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'pipeline'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-[#718078] hover:bg-zinc-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{isMl ? 'പരാതി പരിഹാര പൈപ്പ്‌ലൈൻ' : 'Grievance Pipeline'}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {filteredIssues.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'projects'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-[#718078] hover:bg-zinc-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{isMl ? 'പദ്ധതി രജിസ്ട്രി' : 'Infrastructure Registry'}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {filteredProjects.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#14532D] text-white shadow-xs'
              : 'text-[#718078] hover:bg-zinc-100'
          }`}
        >
          <History className="w-4 h-4" />
          <span>{isMl ? 'റോഡ് കുഴിക്കൽ ചരിത്രം' : 'Excavation Log'}</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
            {completedProjects.length}
          </span>
        </button>
      </div>

      {/* TAB 1: GRIEVANCE RESOLUTION PIPELINE */}
      {activeTab === 'pipeline' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE6] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#17231D]">
                {isMl ? 'പൗരന്മാരുടെ പരാതികൾ & പരിഹാര നടപടികൾ' : 'Citizen Grievances & Resolution Pipeline'}
              </h3>
              <p className="text-[11px] text-[#718078]">
                {isMl
                  ? 'അവസ്ഥ മാറ്റുമ്പോൾ ഡാറ്റാബേസിൽ (Neon DB) തത്സമയം രേഖപ്പെടുത്തപ്പെടുന്നു'
                  : 'Live state synced with PostgreSQL database; persists on refresh'}
              </p>
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#718078] flex items-center gap-1 font-semibold">
                <Filter className="w-3.5 h-3.5" />
                {isMl ? 'ഫിൽട്ടർ:' : 'Filter:'}
              </span>
              <select
                value={grievanceStatusFilter}
                onChange={(e) => setGrievanceStatusFilter(e.target.value)}
                className="px-2.5 py-1 rounded-lg bg-[#F8FAF8] border border-[#E4EBE6] text-xs font-bold text-[#17231D] outline-none cursor-pointer"
              >
                <option value="all">{isMl ? 'എല്ലാ അവസ്ഥകളും (All)' : 'All Statuses'}</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="VERIFIED">Verified</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Grievances List */}
          <div className="space-y-3">
            {filteredIssues.length > 0 ? (
              filteredIssues.map((issue) => {
                const isUpdating = updatingIssueId === issue.id;
                const currentStatus = issue.status || 'UNDER_REVIEW';

                return (
                  <div
                    key={issue.id}
                    className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-3 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#17231D]">
                            {issue.reporter?.fullName || issue.author?.fullName || 'Citizen Reporter'}
                          </span>
                          <span className="text-[10px] text-[#718078]">
                            • {issue.locality || currentLocality}, {issue.district || 'Ernakulam'}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#EAF7EF] text-[#16A34A]">
                            {issue.department?.name || issue.category?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#17231D]">{issue.title || issue.content}</h4>
                        {issue.description && issue.description !== issue.title && (
                          <p className="text-xs text-[#718078] line-clamp-2">{issue.description}</p>
                        )}
                        {issue.resolutionNotes && (
                          <div className="mt-1.5 p-2 bg-emerald-50 rounded-lg border border-emerald-200/60 text-[11px] text-emerald-900 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>
                              <strong>{isMl ? 'നടപടി കുറിപ്പ്:' : 'Official Action:'}</strong> {issue.resolutionNotes}
                            </span>
                          </div>
                        )}
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                          currentStatus === 'RESOLVED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : currentStatus === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : currentStatus === 'VERIFIED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status[currentStatus as keyof typeof t.status] || currentStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E4EBE6] text-xs">
                      <div className="text-[11px] text-[#718078] flex items-center gap-3">
                        <span>{issue.supportsCount || 0} {isMl ? 'പിന്തുണകൾ' : 'supporters'}</span>
                        {issue.address && (
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-[#16A34A]" />
                            {issue.address}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />}

                        {/* Detailed update with notes button */}
                        <button
                          onClick={() => {
                            setSelectedIssueForModal(issue);
                            setIsResolutionModalOpen(true);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white border border-[#E4EBE6] hover:border-[#16A34A] text-xs font-semibold text-[#17231D] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <FileText className="w-3 h-3 text-[#16A34A]" />
                          <span>{isMl ? 'വിശദീകരണം നൽകുക' : 'Action Note'}</span>
                        </button>

                        {/* Quick Status Dropdown */}
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
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#718078] bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
                {isMl
                  ? 'ഈ ഫിൽട്ടറിൽ നിലവിൽ തീർപ്പാക്കാനുള്ള പരാതികൾ ലഭ്യമല്ല.'
                  : 'No active civic complaints match the selected filter.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INFRASTRUCTURE PROJECTS REGISTRY */}
      {activeTab === 'projects' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE6] pb-3">
            <div>
              <h3 className="font-bold text-sm text-[#17231D]">
                {isMl ? 'അടിസ്ഥാനസൗകര്യ പദ്ധതി രജിസ്ട്രി' : 'Infrastructure Project Registry'}
              </h3>
              <p className="text-[11px] text-[#718078]">
                {isMl
                  ? 'വകുപ്പുകൾ ആരംഭിക്കുന്ന പ്രവൃത്തികൾ; അവസ്ഥ മാറ്റുമ്പോൾ DB-യിൽ സംരക്ഷിക്കപ്പെടുന്നു'
                  : 'Track and update execution stages (PLANNED, APPROVED, IN PROGRESS, COMPLETED)'}
              </p>
            </div>

            <button
              onClick={() => setIsProjectModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer active-press"
            >
              <Plus className="w-4 h-4" />
              <span>{isMl ? 'പുതിയ പ്രവൃത്തി ചേർക്കുക' : 'Register Project'}</span>
            </button>
          </div>

          <div className="space-y-3">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((proj) => {
                const isUpdating = updatingProjectId === proj.id;
                return (
                  <div
                    key={proj.id}
                    className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-3 hover:border-zinc-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#16A34A] uppercase bg-[#EAF7EF] px-2 py-0.5 rounded-md">
                            {proj.department?.name || 'Department Project'}
                          </span>
                          <span className="text-[10px] text-[#718078]">
                            • {proj.category?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-[#17231D]">{proj.name}</h4>
                        <p className="text-xs text-[#718078] line-clamp-2">{proj.description}</p>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 ${
                          proj.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : proj.status === 'IN_PROGRESS'
                            ? 'bg-blue-100 text-blue-800'
                            : proj.status === 'APPROVED'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {proj.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Timeline & Metadata */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#718078] bg-white p-2.5 rounded-lg border border-[#E4EBE6]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span className="truncate">{proj.roadName || `${proj.locality}, ${proj.district}`}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span>
                          {proj.startDate ? new Date(proj.startDate).toLocaleDateString() : 'TBD'} — {proj.expectedEndDate ? new Date(proj.expectedEndDate).toLocaleDateString() : 'TBD'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-[#16A34A] shrink-0" />
                        <span>
                          {proj.estimatedCost
                            ? `₹${Number(proj.estimatedCost).toLocaleString('en-IN')}`
                            : 'Budget allocated'}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-[#718078]">
                        {proj.contractorName ? `Contractor: ${proj.contractorName}` : 'Government Executed'}
                      </span>

                      <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#16A34A]" />}
                        <span className="text-[11px] text-[#718078] font-semibold">{isMl ? 'അവസ്ഥ മാറ്റുക:' : 'Status:'}</span>
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
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#718078] bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
                {isMl
                  ? 'ഈ വകുപ്പിൽ നിലവിൽ രേഖപ്പെടുത്തിയ പദ്ധതികൾ ലഭ്യമല്ല.'
                  : 'No registered infrastructure projects for this department.'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INFRASTRUCTURE EXCAVATION HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4">
          <div className="border-b border-[#E4EBE6] pb-3">
            <h3 className="font-bold text-sm text-[#17231D]">
              {isMl ? 'റോഡ് കുഴിക്കൽ & നിർമ്മാണ ചരിത്രം' : 'Excavation & Infrastructure History Log'}
            </h3>
            <p className="text-[11px] text-[#718078]">
              {isMl
                ? 'പുതിയ റോഡ് വീണ്ടും കുഴിക്കുന്നത് ഒഴിവാക്കാൻ കഴിഞ്ഞകാല നിർമ്മാണ ചരിത്രം പരിശോധിക്കാം'
                : 'Maintains records of completed tarring and excavation work to avoid damaging newly laid roads'}
            </p>
          </div>

          <div className="space-y-3">
            {completedProjects.length > 0 ? (
              completedProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3.5 bg-emerald-50/40 rounded-xl border border-emerald-200/60 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{proj.department?.name || 'Department'}</span>
                        <span className="text-[#718078] font-normal">• Completed Work</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#17231D] mt-1">{proj.name}</h4>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      COMPLETED
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600">{proj.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/50 text-[11px] text-[#718078]">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{proj.roadName || `${proj.locality}, ${proj.district}`}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Completed: {proj.actualEndDate ? new Date(proj.actualEndDate).toLocaleDateString() : (proj.expectedEndDate ? new Date(proj.expectedEndDate).toLocaleDateString() : 'Recent')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#718078] bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
                {isMl
                  ? 'നിലവിൽ പൂർത്തിയാക്കിയ റോഡ് പ്രവൃത്തികളുടെ രേഖകൾ ലഭ്യമല്ല. പദ്ധതി പൂർത്തിയാകുമ്പോൾ ഇവിടെ രേഖപ്പെടുത്തപ്പെടും.'
                  : 'No completed excavation records logged yet. Projects marked COMPLETED will appear in this audit log.'}
              </div>
            )}
          </div>
        </div>
      )}
       {conflicts.length > 0 && (
        <div className="space-y-3">
          {conflicts.map((conf) => {
            const isResolved = conf.status === 'RESOLVED';
            return (
              <div
                key={conf.id}
                className={`bg-white rounded-2xl p-5 border shadow-2xs space-y-4 ${
                  isResolved ? 'border-[#E4EBE6]' : 'border-amber-300 bg-amber-50/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4EBE6] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`p-2 rounded-xl ${
                        isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-[#17231D]">
                          {t.coordination.conflictAlert}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          {conf.distanceMeters ? `${conf.distanceMeters}m proximity` : 'Same Stretch'}
                        </span>
                      </div>
                      <p className="text-xs text-[#718078]">
                        {isMl
                          ? 'റോഡ് റീ-ടാറിംഗും പൈപ്പ് ലൈൻ കുഴിക്കലും ഒരേസമയം വരുന്നത് തടയുക'
                          : 'Preventing repeated road excavation & destruction'}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                      isResolved
                        ? 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9]'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {isResolved
                      ? (isMl ? 'സമയക്രമം സമന്വയിപ്പിച്ചു' : 'SCHEDULES SYNCHRONIZED')
                      : (isMl ? 'വൈരുദ്ധ്യം കണ്ടെത്തി' : 'OVERLAP DETECTED')}
                  </span>
                </div>

                {/* Conflicting Projects Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Project A */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#16A34A]">
                      <Building2 className="w-4 h-4" />
                      <span>{conf.projectA?.department?.name || 'Public Works Department (PWD)'}</span>
                    </div>
                    <div className="text-xs font-bold text-[#17231D]">{conf.projectA?.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-[#718078]">
                      <Calendar className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>
                        {conf.projectA?.startDate ? new Date(conf.projectA.startDate).toLocaleDateString() : 'TBD'} — {conf.projectA?.expectedEndDate ? new Date(conf.projectA.expectedEndDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>

                  {/* Project B */}
                  <div className="p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700">
                      <Building2 className="w-4 h-4" />
                      <span>{conf.projectB?.department?.name || 'Kerala Water Authority (KWA)'}</span>
                    </div>
                    <div className="text-xs font-bold text-[#17231D]">{conf.projectB?.name}</div>
                    <div className="flex items-center gap-1 text-[11px] text-[#718078]">
                      <Calendar className="w-3.5 h-3.5 text-blue-700" />
                      <span>
                        {conf.projectB?.startDate ? new Date(conf.projectB.startDate).toLocaleDateString() : 'TBD'} — {conf.projectB?.expectedEndDate ? new Date(conf.projectB.expectedEndDate).toLocaleDateString() : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Joint Action Plan Section */}
                <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900">
                      {t.coordination.actionPlan} ({isMl ? 'വകുപ്പുകളുടെ സംയുക്ത കർമ്മപദ്ധതി' : 'Joint Action Plan'}):
                    </span>
                    <span className="text-[10px] text-amber-800">
                      {isMl ? 'മാറ്റങ്ങൾ രേഖപ്പെടുത്താം' : 'Editable by officials'}
                    </span>
                  </div>

                  <textarea
                    rows={2}
                    value={editingJointPlan}
                    onChange={(e) => setEditingJointPlan(e.target.value)}
                    className="w-full text-xs text-[#17231D] bg-white p-2.5 rounded-lg border border-amber-300 focus:border-[#16A34A] outline-none font-medium resize-none"
                    placeholder="Enter joint coordination agreement..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-[#718078]">
                    {isResolved
                      ? (isMl ? 'ഈ തീരുമാനം രണ്ട് വകുപ്പുകളിലും രേഖപ്പെടുത്തിയിട്ടുണ്ട്.' : 'Agreement logged across departments.')
                      : (isMl ? 'രണ്ട് വകുപ്പുകളുടെയും അംഗീകാരം ആവശ്യമുള്ള ഘട്ടം.' : 'Pending interdepartmental alignment.')}
                  </p>

                  <button
                    onClick={() => handleToggleConflictResolution(conf.id, conf.status)}
                    disabled={isResolvingConflict}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active-press flex items-center gap-2 cursor-pointer ${
                      isResolved
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
                      {isResolved
                        ? (isMl ? 'സമന്വയം പുനഃപരിശോധിക്കുക' : 'Re-open Coordination')
                        : (isMl ? 'സമയക്രമം സമന്വയിപ്പിച്ചു അംഗീകരിക്കുക' : 'Acknowledge & Sync Schedules')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal 1: Register New Infrastructure Project */}
      <ProjectRegistryModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        departments={departments}
        defaultLocality={currentLocality}
        language={language}
        onProjectCreated={(newProj) => {
          showToast(
            isMl
              ? 'പുതിയ പദ്ധതി രജിസ്റ്റർ ചെയ്തു (Auto-Conflict Analyzed)'
              : 'Project registered & analyzed for overlap conflicts'
          );
          loadAllData();
        }}
      />

      {/* Modal 2: Issue Resolution Notes & Status Update */}
      <IssueResolutionModal
        isOpen={isResolutionModalOpen}
        onClose={() => setIsResolutionModalOpen(false)}
        issue={selectedIssueForModal}
        language={language}
        onStatusUpdated={(issueId, newStatus, notes) => {
          showToast(
            isMl
              ? 'പരാതിയുടെ അവസ്ഥയും കുറിപ്പും ഡാറ്റാബേസിൽ രേഖപ്പെടുത്തി'
              : 'Status & official resolution note recorded to DB'
          );
          setIssues((prev) =>
            prev.map((iss) =>
              iss.id === issueId ? { ...iss, status: newStatus, resolutionNotes: notes } : iss
            )
          );
          setPosts(
            posts.map((p) =>
              p.id === issueId ? { ...p, status: newStatus } : p
            )
          );
        }}
      />
    </div>
  );
};
