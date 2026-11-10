'use client';

import React, { useState } from 'react';
import { MapPin, Filter, Navigation, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';

export const DiscoverMapView: React.FC = () => {
  const { language, posts } = useAppStore();
  const t = getT(language);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(posts[0]?.id || null);

  const selectedPost = posts.find((p) => p.id === selectedIssueId) || posts[0];

  const mapPins = [
    { id: 'post_01', title: 'Infopark Road Potholes', locality: 'Kakkanad', lat: 10.0159, lng: 76.3419, urgency: 'HIGH', category: 'ROAD_TRANSPORT' },
    { id: 'post_02', title: 'Pipeline Leakage', locality: 'Perinthalmanna', lat: 10.9760, lng: 76.2254, urgency: 'CRITICAL', category: 'WATER_SUPPLY' },
    { id: 'post_03', title: 'Tilted Electric Post', locality: 'Aluva', lat: 10.1076, lng: 76.3516, urgency: 'HIGH', category: 'ELECTRICITY' },
  ];

  return (
    <div className="space-y-4 pb-16">
      {/* Map Card */}
      <div className="relative w-full h-80 rounded-3xl overflow-hidden border border-[#E6EEE8] shadow-xs bg-[#eef7f0] flex flex-col justify-between p-4">
        {/* Interactive Kerala Map Simulation */}
        <div className="absolute inset-0 bg-[radial-gradient(#087A45_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

        {/* Top Controls on Map */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E6EEE8] text-xs font-semibold text-[#087A45] shadow-xs">
            <Navigation className="w-3.5 h-3.5 text-[#087A45]" />
            <span>Kerala Civic Radar</span>
          </div>
          <span className="text-[11px] bg-white/90 px-2.5 py-1 rounded-full text-[#77847C] border border-[#E6EEE8]">
            3 Active Hotspots
          </span>
        </div>

        {/* Pins on the Map */}
        <div className="relative z-10 flex-1 flex items-center justify-around px-6">
          {mapPins.map((pin) => {
            const isSelected = selectedIssueId === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedIssueId(pin.id)}
                className={`flex flex-col items-center group transition-transform ${
                  isSelected ? 'scale-110 z-20' : 'hover:scale-105'
                }`}
              >
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold shadow-xs whitespace-nowrap mb-1 transition-colors ${
                    isSelected ? 'bg-[#087A45] text-white' : 'bg-white text-[#17251D] border border-[#E6EEE8]'
                  }`}
                >
                  {pin.locality}
                </div>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all ${
                    isSelected
                      ? 'bg-[#087A45] text-white ring-4 ring-[#32C878]/30'
                      : 'bg-white text-[#087A45] border border-[#087A45]'
                  }`}
                >
                  <MapPin className="w-5 h-5 fill-current" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Map Footer Banner */}
        <div className="relative z-10 text-center">
          <span className="text-[11px] text-[#77847C] bg-white/80 backdrop-blur-xs px-3 py-1 rounded-full">
            {language === 'ml' ? 'സമീപ പ്രദേശങ്ങളിലെ പ്രശ്നങ്ങൾ മാപ്പിൽ കാണാം' : 'Showing verified community problems in your radius'}
          </span>
        </div>
      </div>

      {/* Selected Issue Preview Card */}
      {selectedPost && (
        <div className="bg-white rounded-3xl p-5 border border-[#E6EEE8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#087A45]">
              {t.categories[selectedPost.category as keyof typeof t.categories] || selectedPost.category}
            </span>
            <span className="text-xs text-[#77847C]">{selectedPost.locality}, {selectedPost.district}</span>
          </div>

          <h3 className="font-bold text-sm text-[#17251D] leading-snug">
            {selectedPost.content}
          </h3>

          <div className="flex items-center justify-between pt-2 border-t border-[#E6EEE8] text-xs">
            <span className="font-semibold text-[#087A45]">
              {selectedPost.supportsCount} {t.feed.supports}
            </span>
            <span className="text-[#77847C]">{selectedPost.commentsCount} {t.feed.comments}</span>
          </div>
        </div>
      )}
    </div>
  );
};

