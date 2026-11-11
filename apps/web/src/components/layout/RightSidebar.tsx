'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Activity,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { fetchLiveConflicts } from '../../lib/api';

export const RightSidebar: React.FC = () => {
  const { language, setActiveTab, currentLocality, posts } = useAppStore();
  const t = getT(language);
  const [conflict, setConflict] = useState<any>(null);

  useEffect(() => {
    async function loadConflicts() {
      const data = await fetchLiveConflicts(currentLocality);
      if (data && Array.isArray(data) && data.length > 0) {
        const first = data[0];
        setConflict({
          id: first.id,
          title: `${first.projectA?.department?.name || 'PWD'} vs. ${first.projectB?.department?.name || 'KWA'} Overlap`,
          projectA: first.projectA,
          projectB: first.projectB,
          locality: first.projectA?.locality || currentLocality,
          roadName: first.projectA?.roadName || 'Infrastructure Corridor',
          distanceMeters: first.distanceMeters || 50,
          recommendedAction:
            first.jointPlan || first.notes || 'Coordinate scheduling between departments before digging commences.',
          status: first.status,
        });
      } else {
        setConflict(null);
      }
    }
    loadConflicts();
  }, [currentLocality]);

  // Derive real statistics from live posts
  const grievances = posts.filter((p) => p.isInfrastructureIssue);
  const totalGrievances = grievances.length;
  const resolvedCount = grievances.filter((p: any) => p.status === 'RESOLVED').length;
  const inProgressCount = totalGrievances - resolvedCount;
  const resolutionRate = totalGrievances > 0 ? Math.round((resolvedCount / totalGrievances) * 100) : 100;

  // Real trending discussions from live posts
  const trendingPosts = [...posts]
    .sort((a, b) => (b.supportsCount + b.likesCount) - (a.supportsCount + a.likesCount))
    .slice(0, 3);

  return (
    <aside className="hidden lg:flex flex-col w-80 h-[calc(100vh-61px)] sticky top-[61px] border-l border-[#E4EBE6] p-4 space-y-4 bg-white/40 overflow-y-auto no-scrollbar">
      {/* Interdepartmental Project Conflict Card (The Civic Innovation) */}
      {conflict ? (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-900 font-bold text-[11px] uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>{t.coordination.conflictAlert}</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
              {conflict.status || 'Active'}
            </span>
          </div>

          <h4 className="text-xs font-bold text-[#17231D] leading-snug">
            {conflict.title}
          </h4>

          {/* Department Clash Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-[#718078] bg-white/80 p-2 rounded-xl border border-amber-200/50">
            <Layers className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-[#17231D]">{conflict.roadName}</span>
              <span className="text-[10px] text-[#718078] ml-1">({conflict.distanceMeters}m proximity)</span>
            </div>
          </div>

          <p className="text-[11px] text-[#718078] leading-relaxed line-clamp-3">
            {conflict.recommendedAction}
          </p>

          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <span className="text-[10px] text-amber-800 font-semibold">
              {currentLocality}
            </span>
            <Link
              href="/official"
              className="flex items-center gap-1 text-xs text-[#16A34A] font-bold hover:text-[#15803D] transition-colors"
            >
              <span>{language === 'ml' ? 'ഏകോപനം കാണുക' : 'View Action'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-white border border-[#E4EBE6] shadow-2xs space-y-2.5">
          <div className="flex items-center gap-2 text-[#16A34A]">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            <span className="text-xs font-bold text-[#17231D]">
              {language === 'ml' ? 'പദ്ധതി ഏകോപനം' : 'Infrastructure Synchronized'}
            </span>
          </div>
          <p className="text-[11px] text-[#718078] leading-relaxed">
            {language === 'ml'
              ? `${currentLocality} വാർഡിൽ നിലവിൽ വകുപ്പ് പദ്ധതി വൈരുദ്ധ്യങ്ങൾ ഒന്നും കണ്ടെത്തിയിട്ടില്ല.`
              : `No project clashes detected in ${currentLocality}. PWD & KWA projects are aligned.`}
          </p>
        </div>
      )}

      {/* Locality Civic Pulse Widget */}
      <div className="p-4 rounded-2xl bg-white border border-[#E4EBE6] shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#17231D]">
          <span className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-[#16A34A]" />
            <span>{language === 'ml' ? 'പ്രദേശിക സ്ഥിതിവിവരം' : 'Locality Civic Pulse'}</span>
          </span>
          <span className="text-[10px] font-semibold text-[#16A34A] bg-[#EAF7EF] px-2 py-0.5 rounded-full">
            {currentLocality}
          </span>
        </div>

        {/* Pulse Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#718078]">
            <span>Resolution Rate</span>
            <span className="font-bold text-[#16A34A]">{resolutionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#F8FAF8] border border-[#E4EBE6] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#16A34A] to-[#22C55E] rounded-full transition-all"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center pt-1">
          <div className="p-2.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
            <div className="text-base font-extrabold text-[#16A34A]">{resolvedCount}</div>
            <div className="text-[10px] font-medium text-[#718078] mt-0.5">
              {language === 'ml' ? 'പരിഹരിച്ചവ' : 'Resolved'}
            </div>
          </div>
          <div className="p-2.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
            <div className="text-base font-extrabold text-amber-600">{inProgressCount}</div>
            <div className="text-[10px] font-medium text-[#718078] mt-0.5">
              {language === 'ml' ? 'പുരോഗതിയിൽ' : 'In Progress'}
            </div>
          </div>
        </div>
      </div>

      {/* Trending Community Discussions */}
      <div className="p-4 rounded-2xl bg-white border border-[#E4EBE6] shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-[#17231D]">
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#16A34A]" />
            <span>{language === 'ml' ? 'ശ്രദ്ധേയമായ ചർച്ചകൾ' : `Trending in ${currentLocality}`}</span>
          </span>
        </div>

        <div className="space-y-2.5 pt-1">
          {trendingPosts.length > 0 ? (
            trendingPosts.map((post) => (
              <div key={post.id} className="group cursor-pointer">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#16A34A] group-hover:underline truncate max-w-[170px]">
                    #{post.locality}·{post.category || 'Civic'}
                  </span>
                  <span className="text-[10px] text-[#718078] flex-shrink-0">
                    {post.supportsCount} {language === 'ml' ? 'പിന്തുണകൾ' : 'supports'}
                  </span>
                </div>
                <p className="text-xs text-[#17231D] font-medium mt-0.5 line-clamp-1">
                  {post.content}
                </p>
              </div>
            ))
          ) : (
            <div className="p-3 bg-[#F8FAF8] rounded-xl text-center text-xs text-[#718078] border border-[#E4EBE6]">
              {language === 'ml'
                ? 'സജീവ ചർച്ചകൾ ലഭ്യമല്ല. ആദ്യത്തെ പോസ്റ്റ് പങ്കുവെക്കൂ!'
                : 'No discussions yet. Publish the first update!'}
            </div>
          )}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-1 text-[11px] text-[#94A39B] space-y-1">
        <div className="flex items-center gap-2">
          <span>Naatukoottam © 2026</span>
          <span>·</span>
          <span>Kerala Open Civic Net</span>
        </div>
        <p className="text-[10px]">Empowering citizens & departments for faster resolution.</p>
      </div>
    </aside>
  );
};
