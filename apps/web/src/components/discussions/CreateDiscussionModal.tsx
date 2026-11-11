'use client';

import React, { useState } from 'react';
import {
  X,
  Radio,
  Lock,
  Globe,
  Sparkles,
  Users,
  MapPin,
  MessageSquare,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { createDiscussionApi } from '../../lib/api';
import { DiscussionRoomType } from '../../types';
import { EXTENDED_KERALA_LOCALITIES } from '../../lib/geolocation';

interface CreateDiscussionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newRoom: any) => void;
}

export const CreateDiscussionModal: React.FC<CreateDiscussionModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { language, currentLocality, currentUser, isAuthenticated, setIsAuthModalOpen } =
    useAppStore();
  const t = getT(language);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DiscussionRoomType>('CHANNEL');
  const [locality, setLocality] = useState(currentLocality || 'Kakkanad');
  const [category, setCategory] = useState('ROAD_TRANSPORT');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (!isAuthenticated) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const created = await createDiscussionApi({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        locality,
        district: currentUser.district || 'Ernakulam',
        category,
      });

      setName('');
      setDescription('');
      onCreated(created);
      onClose();
    } catch (err: any) {
      console.error('Failed to create space:', err);
      setErrorMsg(err.message || 'Failed to create discussion group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-[#E4EBE6] space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E4EBE6] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9]">
              <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17231D]">
                {language === 'ml' ? 'പുതിയ ചർച്ച ആരംഭിക്കുക' : 'Start Community Discussion'}
              </h3>
              <p className="text-[11px] text-[#718078]">
                {language === 'ml'
                  ? 'പ്രശ്നങ്ങൾ പരിഹരിക്കാൻ ചാനലോ അല്ലെങ്കിൽ രഹസ്യ സംഘമോ ഉണ്ടാക്കുക'
                  : 'Create a channel or private taskforce for neighborhood solutions'}
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Space Type Selector: Channel vs Group */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#17231D] block">
              {language === 'ml' ? 'വിഭാഗം തിരഞ്ഞെടുക്കുക' : 'Choose Space Type'}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Public Channel Option */}
              <div
                onClick={() => setType('CHANNEL')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  type === 'CHANNEL'
                    ? 'border-[#16A34A] bg-[#EAF7EF]/70 shadow-xs ring-1 ring-[#16A34A]'
                    : 'border-[#E4EBE6] bg-[#F8FAF8] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                      <Globe className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-[#17231D]">
                      {language === 'ml' ? '📢 പൊതു ചാനൽ' : '📢 Public Channel'}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="spaceType"
                    checked={type === 'CHANNEL'}
                    onChange={() => setType('CHANNEL')}
                    className="accent-[#16A34A]"
                  />
                </div>
                <p className="text-[11px] text-[#718078] leading-relaxed">
                  {language === 'ml'
                    ? 'നാട്ടിലെ ആർക്കും സ്വതന്ത്രമായി ഇതിൽ അംഗമാകാം, പ്രശ്നങ്ങൾ ചർച്ച ചെയ്യാം.'
                    : 'Anyone in the community can join freely and discuss neighborhood issues.'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-[#16A34A] bg-white px-2 py-0.5 rounded-full border border-[#D1EBD9]">
                  {language === 'ml' ? 'ആർക്കും ചേരാം' : 'Open to all'}
                </span>
              </div>

              {/* Private Group Option */}
              <div
                onClick={() => setType('GROUP')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  type === 'GROUP'
                    ? 'border-amber-500 bg-amber-50/70 shadow-xs ring-1 ring-amber-500'
                    : 'border-[#E4EBE6] bg-[#F8FAF8] hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                      <Lock className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-bold text-[#17231D]">
                      {language === 'ml' ? '🔒 സ്വകാര്യ സംഘം' : '🔒 Private Group'}
                    </span>
                  </div>
                  <input
                    type="radio"
                    name="spaceType"
                    checked={type === 'GROUP'}
                    onChange={() => setType('GROUP')}
                    className="accent-amber-600"
                  />
                </div>
                <p className="text-[11px] text-[#718078] leading-relaxed">
                  {language === 'ml'
                    ? 'ഒരു അംഗം ചേർത്താൽ മാത്രമേ മറ്റുള്ളവർക്ക് ഇതിൽ പ്രവേശിക്കാൻ സാധിക്കൂ.'
                    : 'Can only be joined by existing group members adding them.'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full border border-amber-200">
                  {language === 'ml' ? 'അംഗങ്ങൾക്ക് മാത്രം ചേർക്കാം' : 'Member-invite only'}
                </span>
              </div>
            </div>
          </div>

          {/* Group / Channel Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17231D]">
              {language === 'ml' ? 'പേര്' : 'Title / Topic'}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                language === 'ml'
                  ? 'ഉദാ: റോഡ് കുഴികൾ പരിഹാര സമിതി, കാക്കനാട്'
                  : 'e.g., Kakkanad Expressway Potholes Action Group'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] text-xs text-[#17231D] outline-none shadow-2xs"
              required
            />
          </div>

          {/* Locality & Problem Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'പ്രദേശം / വാർഡ്' : 'Ward / Locality'}</span>
              </label>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl text-xs text-[#17231D] outline-none"
              >
                {EXTENDED_KERALA_LOCALITIES.map((loc) => (
                  <option key={loc.name} value={loc.name}>
                    {loc.name} ({loc.district})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D]">
                {language === 'ml' ? 'വിഷയം' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl text-xs text-[#17231D] outline-none"
              >
                <option value="ROAD_TRANSPORT">{language === 'ml' ? 'റോഡും ഗതാഗതവും' : 'Road & Transport'}</option>
                <option value="WATER_SUPPLY">{language === 'ml' ? 'കുടിവെള്ളം & പൈപ്പ്' : 'Water Supply'}</option>
                <option value="ELECTRICITY">{language === 'ml' ? 'വൈദ്യുതി & ലൈറ്റുകൾ' : 'Electricity & Lights'}</option>
                <option value="WASTE_MANAGEMENT">{language === 'ml' ? 'മാലിന്യ സംസ്കരണം' : 'Waste Management'}</option>
                <option value="DRAINAGE">{language === 'ml' ? 'ഓടകളും വെള്ളക്കെട്ടും' : 'Drainage & Flooding'}</option>
                <option value="GENERAL">{language === 'ml' ? 'പൊതു വിഷയങ്ങൾ' : 'General Civic Action'}</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17231D]">
              {language === 'ml' ? 'വിവരണം (ഓപ്ഷണൽ)' : 'Goal / Description (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={
                language === 'ml'
                  ? 'ഈ കൂട്ടായ്മ എന്തിനുവേണ്ടിയാണ് രൂപീകരിച്ചിരിക്കുന്നത്...'
                  : 'What problem is this group trying to solve together with local residents?'
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE6] focus:border-[#16A34A] text-xs text-[#17231D] outline-none shadow-2xs resize-none"
            />
          </div>

          {/* Submit Action Buttons */}
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
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold transition-all disabled:opacity-50 active-press shadow-xs flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'ml' ? 'രൂപീകരിക്കുന്നു...' : 'Creating Space...'}</span>
                </>
              ) : (
                <span>
                  {language === 'ml'
                    ? type === 'CHANNEL'
                      ? 'ചാനൽ രൂപീകരിക്കുക'
                      : 'സംഘം രൂപീകരിക്കുക'
                    : type === 'CHANNEL'
                    ? 'Create Public Channel'
                    : 'Create Private Group'}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

