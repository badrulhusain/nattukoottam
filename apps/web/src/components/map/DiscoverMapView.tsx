'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Filter,
  Navigation,
  AlertCircle,
  CheckCircle2,
  ChevronUp,
  MessageSquare,
  Compass,
  ExternalLink,
  Flame,
  Search,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { MapPinItem } from './LeafletInteractiveMap';

// Dynamically import Leaflet with ssr: false for Next.js App Router
const LeafletInteractiveMap = dynamic(
  () => import('./LeafletInteractiveMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] sm:h-[460px] rounded-2xl bg-gradient-to-b from-[#EAF7EF]/40 to-[#F8FAF8] border border-[#E4EBE6] animate-pulse flex flex-col items-center justify-center text-[#718078] gap-3">
        <Loader2 className="w-8 h-8 text-[#16A34A] animate-spin" />
        <span className="text-xs font-semibold text-[#17231D]">
          Loading Kerala Ward Geography Radar...
        </span>
      </div>
    ),
  }
);

export const DiscoverMapView: React.FC = () => {
  const {
    language,
    posts,
    userLocation,
    toggleSupport,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();
  const t = getT(language);

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyUrgent, setOnlyUrgent] = useState(false);

  // Categories list for filter chips
  const categoryFilters = [
    { id: 'all', label: language === 'ml' ? 'എല്ലാം' : 'All' },
    { id: 'ROAD_TRANSPORT', label: language === 'ml' ? 'റോഡുകൾ' : 'Roads' },
    { id: 'WATER_SANITATION', label: language === 'ml' ? 'കുടിവെള്ളം' : 'Water' },
    { id: 'ELECTRICITY', label: language === 'ml' ? 'വൈദ്യുതി' : 'Electricity' },
    { id: 'WASTE_MANAGEMENT', label: language === 'ml' ? 'മാലിന്യം' : 'Waste' },
  ];

  // Filter posts that have valid geo-coordinates
  const geoTaggedPosts = useMemo(() => {
    return posts.filter((p) => {
      const hasCoords =
        typeof p.latitude === 'number' &&
        typeof p.longitude === 'number' &&
        !isNaN(p.latitude) &&
        !isNaN(p.longitude);

      if (!hasCoords) return false;

      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Urgency filter
      if (onlyUrgent && p.urgency !== 'CRITICAL' && p.urgency !== 'HIGH') {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesLocality = p.locality?.toLowerCase().includes(query);
        const matchesDistrict = p.district?.toLowerCase().includes(query);
        const matchesContent = p.content?.toLowerCase().includes(query);
        if (!matchesLocality && !matchesDistrict && !matchesContent) {
          return false;
        }
      }

      return true;
    });
  }, [posts, selectedCategory, onlyUrgent, searchQuery]);

  // Construct Map Pins for Leaflet
  const mapPins: MapPinItem[] = useMemo(() => {
    const pins: MapPinItem[] = geoTaggedPosts.map((p) => ({
      id: p.id,
      title: p.content.slice(0, 45) + (p.content.length > 45 ? '...' : ''),
      locality: p.locality,
      district: p.district,
      lat: p.latitude!,
      lng: p.longitude!,
      urgency: p.urgency as any,
      category: p.category,
      mediaUrl: p.mediaUrls && p.mediaUrls.length > 0 ? p.mediaUrls[0] : undefined,
      supports: p.supportsCount,
      comments: p.commentsCount,
      reporterName: p.author?.fullName,
      createdAt: p.createdAt,
      isUserLoc: false,
    }));

    // Include the user's current GPS location if detected/saved
    if (userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number') {
      pins.unshift({
        id: 'user_live_loc',
        title: language === 'ml' ? 'നിങ്ങളുടെ വാർഡ് ലൊക്കേഷൻ' : 'Your Ward Location',
        locality: userLocation.locality,
        district: userLocation.district,
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        isUserLoc: true,
      });
    }

    return pins;
  }, [geoTaggedPosts, userLocation, language]);

  // Currently selected post
  const selectedPost = useMemo(() => {
    if (selectedIssueId) {
      return geoTaggedPosts.find((p) => p.id === selectedIssueId) || null;
    }
    return geoTaggedPosts.length > 0 ? geoTaggedPosts[0] : null;
  }, [selectedIssueId, geoTaggedPosts]);

  return (
    <div className="space-y-4 pb-20">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl p-3 border border-[#E4EBE6] shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative flex items-center">
            <Search className="w-4 h-4 text-[#718078] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ml'
                  ? 'വാർഡ് അല്ലെങ്കിൽ പ്രശ്നം തിരയുക...'
                  : 'Search by ward, locality or issue...'
              }
              className="w-full bg-[#F8FAF8] rounded-xl pl-9 pr-3 py-2 text-xs border border-[#E4EBE6] focus:border-[#16A34A] focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={() => setOnlyUrgent(!onlyUrgent)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active-press border cursor-pointer ${
              onlyUrgent
                ? 'bg-red-50 text-red-600 border-red-200 shadow-2xs'
                : 'bg-[#F8FAF8] text-[#718078] border-[#E4EBE6] hover:bg-zinc-100'
            }`}
          >
            <Flame className={`w-3.5 h-3.5 ${onlyUrgent ? 'fill-red-500' : ''}`} />
            <span>{language === 'ml' ? 'അടിയന്തിരം' : 'Urgent'}</span>
          </button>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {categoryFilters.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all active-press cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-[#F8FAF8] text-[#718078] hover:text-[#17231D] hover:bg-[#EAF7EF]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real Geographic Interactive Leaflet Map */}
      <LeafletInteractiveMap
        pins={mapPins}
        selectedPinId={selectedPost?.id || null}
        onSelectPin={(id) => {
          if (id !== 'user_live_loc') {
            setSelectedIssueId(id);
          }
        }}
        userLocation={userLocation}
        language={language}
      />

      {/* Selected Hotspot Inspection Card */}
      {selectedPost ? (
        <div className="bg-white rounded-2xl p-5 border border-[#E4EBE6] shadow-2xs space-y-4 animate-in fade-in duration-200">
          {/* Card Header: Category & Location */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-2.5 py-1 rounded-lg uppercase tracking-wide">
              {t.categories[selectedPost.category as keyof typeof t.categories] || selectedPost.category}
            </span>

            <div className="flex items-center gap-1.5 text-xs text-[#718078] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{selectedPost.locality}, {selectedPost.district}</span>
            </div>
          </div>

          {/* Issue Content / Title */}
          <h3 className="font-bold text-base text-[#17231D] leading-snug">
            {selectedPost.content}
          </h3>

          {/* Photo Media Preview if present */}
          {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
            <div className="relative rounded-xl overflow-hidden border border-[#E4EBE6] max-h-56 bg-zinc-950 flex items-center justify-center">
              <img
                src={selectedPost.mediaUrls[0]}
                alt="Civic evidence"
                className="w-full h-full max-h-56 object-cover"
              />
            </div>
          )}

          {/* Location Coordinates & Directions */}
          <div className="flex items-center justify-between bg-[#F8FAF8] p-3 rounded-xl border border-[#E4EBE6] text-xs">
            <div className="flex items-center gap-2 text-[#718078]">
              <Compass className="w-4 h-4 text-[#16A34A]" />
              <span className="font-mono text-[11px]">
                {selectedPost.latitude?.toFixed(4)}, {selectedPost.longitude?.toFixed(4)}
              </span>
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPost.latitude},${selectedPost.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-bold text-[#16A34A] hover:underline"
            >
              <span>{language === 'ml' ? 'ദിശകൾ കാണുക' : 'Get Directions'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between pt-2 border-t border-[#E4EBE6] text-xs">
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  setIsAuthModalOpen(true, 'login');
                } else {
                  toggleSupport(selectedPost.id);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all active-press cursor-pointer ${
                selectedPost.isSupported
                  ? 'bg-[#16A34A] text-white'
                  : 'bg-[#EAF7EF] text-[#16A34A] border border-[#D1EBD9] hover:bg-[#d9f2e2]'
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span>{selectedPost.supportsCount} {t.feed.supports}</span>
            </button>

            <span className="text-[#718078] font-medium flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{selectedPost.commentsCount} {t.feed.comments}</span>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#E4EBE6] shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-full bg-[#EAF7EF] text-[#16A34A] flex items-center justify-center mx-auto">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#17231D]">
            {language === 'ml' ? 'മാപ്പിൽ റിപ്പോർട്ടുകൾ ഒന്നുമില്ല' : 'No matching geo-tagged reports'}
          </h4>
          <p className="text-xs text-[#718078] max-w-xs mx-auto">
            {language === 'ml'
              ? 'ഫിൽട്ടറുകൾ മാറ്റി പരിശോധിക്കുക അല്ലെങ്കിൽ പുതിയൊരു പ്രശ്നം രേഖപ്പെടുത്തുക.'
              : 'Try clearing filters or report an issue with GPS coordinates to view it here.'}
          </p>
        </div>
      )}

      {/* Nearby Hotspots List */}
      {geoTaggedPosts.length > 1 && (
        <div className="bg-white rounded-2xl p-4 border border-[#E4EBE6] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-[#17231D] uppercase tracking-wider">
              {language === 'ml' ? 'മറ്റ് വാർഡ് പ്രശ്നങ്ങൾ' : 'All Ward Hotspots in Radar'}
            </h4>
            <span className="text-[11px] font-bold text-[#16A34A]">
              {geoTaggedPosts.length} {language === 'ml' ? 'റിപ്പോർട്ടുകൾ' : 'reports'}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
            {geoTaggedPosts.map((post) => {
              const isSelected = selectedPost?.id === post.id;
              return (
                <button
                  key={post.id}
                  onClick={() => setSelectedIssueId(post.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-[#EAF7EF] border-[#16A34A] shadow-xs'
                      : 'bg-[#F8FAF8] border-[#E4EBE6] hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className="p-2 rounded-lg bg-white border border-[#E4EBE6] text-[#16A34A] shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </span>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-[#17231D] truncate">
                        {post.content}
                      </div>
                      <div className="text-[10px] text-[#718078]">
                        {post.locality}, {post.district}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      post.urgency === 'CRITICAL'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-orange-100 text-orange-600'
                    }`}
                  >
                    {post.urgency || 'ACTIVE'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
