'use client';

import React from 'react';
import { Image as ImageIcon, MapPin, AlertCircle, Sparkles, Send } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const PostComposer: React.FC = () => {
  const { currentUser, currentLocality, language, setIsCreateModalOpen } = useAppStore();
  const t = getT(language);

  return (
    <div
      onClick={() => setIsCreateModalOpen(true)}
      className="bg-white rounded-2xl p-4 border border-[#E4EBE6] shadow-2xs hover:border-[#D0DBD3] transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.fullName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-[#EAF7EF]"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#16A34A] ring-2 ring-white" />
        </div>

        <div className="flex-1 bg-[#F8FAF8] group-hover:bg-[#EAF7EF]/40 px-4 py-2.5 rounded-xl text-xs text-[#718078] transition-colors border border-transparent group-hover:border-[#D1EBD9]">
          {language === 'ml'
            ? `${currentLocality} വാർഡിൽ എന്താണ് നടക്കുന്നത്? പരാതികളോ വിവരങ്ങളോ പങ്കുവെക്കൂ...`
            : `What's happening in ${currentLocality}? Share updates or report a civic issue...`}
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#E4EBE6]/80 text-xs text-[#718078]">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAF8] hover:text-[#17231D] transition-colors text-[11px] font-medium">
            <ImageIcon className="w-4 h-4 text-[#16A34A]" />
            <span className="hidden sm:inline">Photo / Media</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-[#F8FAF8] hover:text-[#17231D] transition-colors text-[11px] font-medium">
            <MapPin className="w-4 h-4 text-[#16A34A]" />
            <span className="hidden sm:inline">GPS Ward</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 hover:text-orange-700 transition-colors text-[11px] font-medium text-orange-600">
            <AlertCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Civic Grievance</span>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold shadow-xs transition-colors active-press"
        >
          <span>{language === 'ml' ? 'പോസ്റ്റ്' : 'Post'}</span>
          <Send className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
