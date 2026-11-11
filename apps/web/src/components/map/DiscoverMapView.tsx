'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Filter,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  MessageSquare,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const DiscoverMapView: React.FC = () => {
  const { language, posts, userLocation, toggleSupport } = useAppStore();
  const t = getT(language);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const mapPins = [
    ...posts
      .filter((p) => p.latitude && p.longitude)
      .map((p) => ({
        id: p.id,
        title: p.content.slice(0, 35) + (p.content.length > 35 ? '...' : ''),
        locality: p.locality,
        lat: p.latitude!,
        lng: p.longitude!,
        urgency: p.urgency || 'HIGH',
        category: p.category || 'OTHER',
        supports: p.supportsCount,
        isUserLoc: false,
      })),
    ...(userLocation
      ? [
          {
            id: 'user_live_loc',
            title: language === 'ml' ? 'നിങ്ങളുടെ ലൊക്കേഷൻ' : 'Your Location',
            locality: userLocation.locality,
            lat: userLocation.latitude,
            lng: userLocation.longitude,
            urgency: 'LOW',
            category: 'OTHER',
            isUserLoc: true,
            supports: 0,
          },
        ]
      : []),
  ];

  const selectedPost = posts.find((p) => p.id === selectedIssueId) || (posts.length > 0 ? posts[0] : null);

  return (
    <div className="space-y-4 pb-20">
      {/* Map Card */}
      <div className="relative w-full h-84 rounded-2xl overflow-hidden border border-[#E4EBE6] shadow-2xs bg-gradient-to-b from-[#EAF7EF]/60 to-[#F8FAF8] flex flex-col justify-between p-4">
        {/* Soft Grid Background Pattern representing Map Coordinates */}
        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#16A34A15_1px,transparent_1px),linear-gradient(to_bottom,#16A34A15_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* Map Top Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-[#E4EBE6] shadow-xs">
            <Compass className="w-4 h-4 text-[#16A34A]" />
            <span className="text-xs font-bold text-[#17231D]">
              {language === 'ml' ? 'കേരള വാർഡ് റഡാർ മാപ്പ്' : 'Kerala Ward Radar'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl border border-[#E4EBE6] text-[11px] font-semibold text-[#16A34A]">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-ping" />
            <span>{mapPins.length} {language === 'ml' ? 'പോയിന്റുകൾ' : 'Hotspots'}</span>
          </div>
        </div>

        {/* Dynamic Pins Representation */}
        <div className="relative z-10 w-full flex-1 flex items-center justify-around py-6">
          {mapPins.map((pin, idx) => {
            const isSelected = selectedIssueId === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => {
                  if (!(pin as any).isUserLoc) {
                    setSelectedIssueId(pin.id);
                  }
                }}
                className={`group flex flex-col items-center transition-all ${
                  idx % 2 === 0 ? '-translate-y-3' : 'translate-y-3'
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold mb-1 shadow-xs transition-transform group-hover:scale-105 ${
                    (pin as any).isUserLoc
                      ? 'bg-blue-600 text-white'
                      : isSelected
                      ? 'bg-[#16A34A] text-white'
                      : 'bg-white text-[#17231D] border border-[#E4EBE6]'
                  }`}
                >
                  {(pin as any).isUserLoc ? `📍 You (${pin.locality})` : pin.locality}
                </div>

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                    (pin as any).isUserLoc
                      ? 'bg-blue-600 text-white ring-4 ring-blue-300 animate-pulse'
                      : isSelected
                      ? 'bg-[#16A34A] text-white ring-4 ring-[#16A34A]/25'
                      : 'bg-white text-[#16A34A] border border-[#16A34A]/40'
                  }`}
                >
                  <MapPin className="w-4.5 h-4.5 fill-current" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Bottom Hint */}
        <div className="relative z-10 text-center">
          <span className="text-[11px] text-[#718078] bg-white/90 backdrop-blur-xs px-3.5 py-1 rounded-full border border-[#E4EBE6]">
            {language === 'ml'
              ? 'ഭൂപടത്തിലെ വാർഡുകളിൽ ക്ലിക്ക് ചെയ്തു പ്രശ്നങ്ങൾ പരിശോധിക്കുക'
              : 'Tap pins on the radar to inspect ward issues'}
          </span>
        </div>
      </div>

      {/* Selected Hotspot Inspection Card */}
      {selectedPost ? (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-2.5 py-0.5 rounded-md">
              {t.categories[selectedPost.category as keyof typeof t.categories] || selectedPost.category}
            </span>
            <div className="flex items-center gap-1 text-xs text-[#718078] font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{selectedPost.locality}, {selectedPost.district}</span>
            </div>
          </div>

          <h3 className="font-bold text-sm text-[#17231D] leading-snug">
            {selectedPost.content}
          </h3>

          <div className="flex items-center justify-between pt-3 border-t border-[#E4EBE6] text-xs">
            <button
              onClick={() => toggleSupport(selectedPost.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active-press ${
                selectedPost.isSupported
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9]'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span>{selectedPost.supportsCount} {t.feed.supports}</span>
            </button>

            <span className="text-[#718078] font-medium">
              {selectedPost.commentsCount} {t.feed.comments}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#E4EBE6] shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#EAF7EF] text-[#16A34A] flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17231D]">
            {language === 'ml' ? 'മാപ്പിൽ റിപ്പോർട്ടുകൾ ഒന്നുമില്ല' : 'No geo-tagged reports yet'}
          </h4>
          <p className="text-xs text-[#718078] max-w-xs mx-auto">
            {language === 'ml'
              ? 'നിങ്ങളുടെ പ്രദേശത്ത് പുതിയൊരു പരാതിയോ പൊതുവിവരമോ രേഖപ്പെടുത്തൂ.'
              : 'Add GPS coordinates when reporting an issue to view it on the community map.'}
          </p>
        </div>
      )}
    </div>
  );
};
