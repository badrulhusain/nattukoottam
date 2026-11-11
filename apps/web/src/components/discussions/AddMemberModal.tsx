'use client';

import React, { useState } from 'react';
import { X, UserPlus, Phone, Loader2, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { addMemberToGroupApi } from '../../lib/api';

interface AddMemberModalProps {
  isOpen: boolean;
  roomId: string;
  roomName: string;
  onClose: () => void;
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  roomId,
  roomName,
  onClose,
  onMemberAdded,
}) => {
  const { language } = useAppStore();
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await addMemberToGroupApi(roomId, { phone: phone.trim() });
      setSuccessMsg(
        language === 'ml'
          ? 'അംഗത്തെ വിജയകരമായി ചേർത്തു!'
          : 'Member added to group successfully!'
      );
      setPhone('');
      onMemberAdded();
      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to add member:', err);
      setErrorMsg(
        err.message ||
          (language === 'ml'
            ? 'അംഗത്തെ ചേർക്കാൻ കഴിഞ്ഞില്ല. ഫോൺ നമ്പർ പരിശോധിക്കുക.'
            : 'Failed to add member. Please check phone number.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-[#E4EBE6] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4EBE6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17231D]">
                {language === 'ml' ? 'അംഗത്തെ ചേർക്കുക' : 'Add Group Member'}
              </h3>
              <p className="text-[11px] text-[#718078] truncate max-w-[240px]">
                {roomName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#16A34A] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17231D] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{language === 'ml' ? 'അംഗത്തിന്റെ ഫോൺ നമ്പർ' : 'Registered Mobile Number'}</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g., 9847012345"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] text-xs text-[#17231D] outline-none shadow-2xs"
              required
            />
            <p className="text-[10px] text-[#718078]">
              {language === 'ml'
                ? 'നാട്ടുകൂട്ടത്തിൽ രജിസ്റ്റർ ചെയ്ത ഫോൺ നമ്പർ നൽകി നിങ്ങളുടെ സംഘത്തിലേക്ക് ക്ഷണിക്കാം.'
                : 'Enter the registered mobile number of the neighbor or citizen to add them to this private group.'}
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E4EBE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
            >
              {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !phone.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all disabled:opacity-50 active-press shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ml' ? 'ചേർക്കുന്നു...' : 'Adding...'}</span>
                </>
              ) : (
                <span>{language === 'ml' ? 'സംഘത്തിൽ ചേർക്കുക' : 'Add to Group'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

