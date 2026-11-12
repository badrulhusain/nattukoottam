'use client';

import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { updateIssueStatusApi } from '../../lib/api';
import { IssueStatus } from '../../types';

interface IssueResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: any;
  onStatusUpdated: (issueId: string, newStatus: IssueStatus, notes: string) => void;
  language?: 'ml' | 'en';
}

export const IssueResolutionModal: React.FC<IssueResolutionModalProps> = ({
  isOpen,
  onClose,
  issue,
  onStatusUpdated,
  language = 'ml',
}) => {
  const isMl = language === 'ml';

  const [status, setStatus] = useState<IssueStatus>(issue?.status || 'IN_PROGRESS');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !issue) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      setIsSubmitting(true);
      await updateIssueStatusApi(issue.id, status, notes.trim() || undefined);
      onStatusUpdated(issue.id, status, notes.trim());
      onClose();
    } catch (err: any) {
      console.error('Failed to update issue status with notes:', err);
      setErrorMessage(err.message || 'Failed to update issue status');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-[#E4EBE6] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#14532D] to-[#15803D] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-white" />
            </span>
            <div>
              <h3 className="font-bold text-sm">
                {isMl ? 'പരാതിയുടെ അവസ്ഥ & ഔദ്യോഗിക വിശദീകരണം' : 'Update Grievance & Official Resolution'}
              </h3>
              <p className="text-[11px] text-emerald-200 line-clamp-1">
                {issue.title || issue.content || 'Issue Status Update'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Grievance Summary Box */}
          <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#17231D]">{issue.author?.fullName || 'Citizen'}</span>
              <span className="text-[10px] text-[#718078]">{issue.locality}, {issue.district}</span>
            </div>
            <p className="text-zinc-600 line-clamp-2">{issue.content || issue.description}</p>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="font-bold text-[#17231D]">
              {isMl ? 'പുതിയ പരിഹാര അവസ്ഥ' : 'Resolution Status'} *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IssueStatus)}
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] bg-white font-bold text-[#17231D] focus:border-[#16A34A] outline-none"
            >
              <option value="UNDER_REVIEW">{isMl ? 'പരിശോധനയിൽ (Under Review)' : 'Under Review'}</option>
              <option value="VERIFIED">{isMl ? 'എഞ്ചിനീയർ പരിശോധിച്ച് ഉറപ്പുവരുത്തി (Verified)' : 'Verified by Engineer'}</option>
              <option value="IN_PROGRESS">{isMl ? 'പ്രവൃത്തി പുരോഗമിക്കുന്നു (Work in Progress)' : 'Work in Progress'}</option>
              <option value="WAITING_FOR_COORDINATION">{isMl ? 'വകുപ്പ് സമന്വയത്തിനായി കാത്തിരിക്കുന്നു' : 'Waiting for Interdepartmental Coordination'}</option>
              <option value="RESOLVED">{isMl ? 'പരിഹരിച്ചു & പൂർത്തിയായി (Resolved & Inspected)' : 'Resolved & Inspected'}</option>
              <option value="REJECTED">{isMl ? 'തള്ളി / പരിഹരിക്കാൻ സാധ്യമല്ല (Rejected)' : 'Rejected / Not Feasible'}</option>
            </select>
          </div>

          {/* Resolution Notes / Explanation */}
          <div className="space-y-1">
            <label className="font-bold text-[#17231D]">
              {isMl ? 'ഔദ്യോഗിക വിശദീകരണം / നടപടിക്കുറിപ്പ്' : 'Official Resolution Notes & Explanation'}
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={
                isMl
                  ? 'ഉദാ: റോഡിലെ കുഴികൾ വെറ്റ് മിക്സ് മക്കാഡം ഉപയോഗിച്ച് അടച്ചു ടാറിംഗ് പൂർത്തിയാക്കി...'
                  : 'e.g., PWD repair contractor completed asphalt patch leveling. Inspected by Assistant Engineer.'
              }
              className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] outline-none font-medium resize-none"
            />
            <p className="text-[10px] text-[#718078]">
              {isMl
                ? 'ഈ വിശദീകരണം പരാതിക്കാരനും പ്രദേശവാസികൾക്കും അവരുടെ ആപ്പിൽ ലഭ്യമാകും.'
                : 'This explanation will be recorded in official history and visible to citizens.'}
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E4EBE6]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718078] hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {isMl ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#16A34A] hover:bg-[#15803D] text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active-press"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isMl ? 'സൂക്ഷിക്കുന്നു...' : 'Saving to DB...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isMl ? 'അവസ്ഥ മാറ്റുക (Save)' : 'Save Status'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

