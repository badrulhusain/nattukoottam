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
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(posts[0]?.id || null);

  const selectedPost = posts.find((p) => p.id === selectedIssueId) || posts[0];

  const mapPins = [
    {
      id: 'post_01',
      title: 'Infopark Road Potholes',
      locality: 'Kakkanad',
      lat: 10.0159,
      lng: 76.3419,
      urgency: 'HIGH',
      category: 'ROAD_TRANSPORT',
      supports: 634,
    },
    {
      id: 'post_02',
      title: 'Pipeline Leakage',
      locality: 'Perinthalmanna',
      lat: 10.976,
      lng: 76.2254,
      urgency: 'CRITICAL',
      category: 'WATER_SUPPLY',
      supports: 489,
    },
    {
      id: 'post_03',
      title: 'Tilted Electric Post',
      locality: 'Aluva',
      lat: 10.1076,
      lng: 76.3516,
      urgency: 'HIGH',
      category: 'ELECTRICITY',
      supports: 312,
    },
    ...(userLocation
      ? [
          {
            id: 'user_live_loc',
            title: 'Your Location',
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

  return (
    <div className="space-y-4 pb-20">
      {/* Map Card */}
      <div className="relative w-full h-84 rounded-2xl overflow-hidden border border-[#E4EBE6] shadow-2xs bg-gradient-to-b from-[#EAF7EF]/60 to-[#F8FAF8] flex flex-col justify-between p-4">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#16A34A_1px,transparent_1px)] [background-size:20px_20px] opacity-15" />

        {/* Top Radar Bar */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-[#E4EBE6] text-xs font-bold text-[#16A34A] shadow-xs">
            <Compass className="w-3.5 h-3.5 text-[#16A34A]" />
            <span>Kerala Ward Radar</span>
          </div>
          <span className="text-[11px] font-semibold bg-white/95 px-3 py-1 rounded-full text-[#718078] border border-[#E4EBE6]">
            3 Verified Hotspots
          </span>
        </div>

        {/* Interactive Map Pins */}
        <div className="relative z-10 flex-1 flex items-center justify-around px-4">
          {mapPins.map((pin) => {
            const isSelected = selectedIssueId === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedIssueId(pin.id)}
                className={`flex flex-col items-center group transition-transform active-press ${
                  isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs whitespace-nowrap mb-1 transition-colors ${
                    (pin as any).isUserLoc
                      ? 'bg-blue-600 text-white'
                      : isSelected
                      ? 'bg-[#16A34A] text-white shadow-xs'
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
      {selectedPost && (
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

          <h3 className="font-bold text-sm text-[#17251D] leading-snug">
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
      )}
    </div>
  );
};
