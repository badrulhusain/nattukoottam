'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Camera,
  MapPin,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Navigation,
  Compass,
  Edit2,
  ChevronDown,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { IssueCategory, UrgencyLevel } from '../../types';
import {
  getCurrentGpsPosition,
  reverseGeocodeCoordinates,
  EXTENDED_KERALA_LOCALITIES,
  KERALA_DISTRICTS,
  findClosestKeralaLocality,
} from '../../lib/geolocation';

interface CreatePostModalProps {
  autoDetectGps?: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ autoDetectGps = false }) => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    language,
    currentLocality,
    setLocality,
    userLocation,
    setUserLocation,
    addPost,
    currentUser,
  } = useAppStore();
  const t = getT(language);

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<IssueCategory>('ROAD_TRANSPORT');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [mediaUrl, setMediaUrl] = useState('');

  // Location & GPS State
  const [selectedLocality, setSelectedLocality] = useState(currentLocality || 'Kakkanad');
  const [selectedDistrict, setSelectedDistrict] = useState(currentUser.district || 'Ernakulam');
  const [streetAddress, setStreetAddress] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(
    userLocation ? { lat: userLocation.latitude, lng: userLocation.longitude, accuracy: userLocation.accuracy } : null
  );

  const [gpsStatus, setGpsStatus] = useState<'idle' | 'detecting' | 'success' | 'error'>(
    userLocation ? 'success' : 'idle'
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isManualEditOpen, setIsManualEditOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with userLocation if already detected
  useEffect(() => {
    if (userLocation) {
      setSelectedLocality(userLocation.locality);
      setSelectedDistrict(userLocation.district);
      if (userLocation.formattedAddress) {
        setStreetAddress(userLocation.formattedAddress);
      }
      setCoords({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        accuracy: userLocation.accuracy,
      });
      setGpsStatus('success');
    }
  }, [userLocation]);

  if (!isCreateModalOpen) return null;

  const handleDetectGps = async () => {
    setGpsStatus('detecting');
    setGpsError(null);

    try {
      const position = await getCurrentGpsPosition();
      const { latitude, longitude, accuracy } = position.coords;

      // Reverse geocode via OpenStreetMap Nominatim
      const detected = await reverseGeocodeCoordinates(latitude, longitude, accuracy);

      setSelectedLocality(detected.locality);
      setSelectedDistrict(detected.district);
      setStreetAddress(detected.formattedAddress);
      setCoords({
        lat: detected.latitude,
        lng: detected.longitude,
        accuracy: detected.accuracy,
      });

      // Update global app state so entire app knows user's real location
      setUserLocation(detected);
      setLocality(detected.locality);
      setGpsStatus('success');
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      setGpsStatus('error');
      let msg = t.create.gpsError;
      if (err?.code === 1) {
        msg = language === 'ml' 
          ? 'ലൊക്കേഷൻ അനുമതി നൽകിയിട്ടില്ല. താഴെ നിങ്ങളുടെ സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.'
          : 'Location permission was denied. Please select your locality manually below.';
      } else if (err?.code === 3) {
        msg = language === 'ml'
          ? 'ലൊക്കേഷൻ സമയം കഴിഞ്ഞുപോയി. വീണ്ടും ശ്രമിക്കുകയോ നേരിട്ട് നൽകുകയോ ചെയ്യുക.'
          : 'Location acquisition timed out. Please retry or choose your locality below.';
      }
      setGpsError(msg);
      setIsManualEditOpen(true);
    }
  };

  const handleLocalitySelect = (localityName: string) => {
    const loc = EXTENDED_KERALA_LOCALITIES.find((l) => l.name === localityName);
    if (loc) {
      setSelectedLocality(loc.name);
      setSelectedDistrict(loc.district);
      setCoords({ lat: loc.lat, lng: loc.lng, accuracy: 50 });
      setStreetAddress(`${loc.name}, ${loc.district}, Kerala`);
      setLocality(loc.name);
    } else {
      setSelectedLocality(localityName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    // If coordinates were not acquired by GPS, pick representative coordinates for selected locality
    let finalCoords = coords;
    if (!finalCoords) {
      const found = EXTENDED_KERALA_LOCALITIES.find(
        (l) => l.name.toLowerCase() === selectedLocality.toLowerCase()
      ) || EXTENDED_KERALA_LOCALITIES[0];
      finalCoords = { lat: found.lat, lng: found.lng, accuracy: 100 };
    }

    setTimeout(() => {
      addPost({
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          locality: selectedLocality,
        },
        content,
        category,
        urgency,
        locality: selectedLocality,
        district: selectedDistrict,
        address: streetAddress || `${selectedLocality}, ${selectedDistrict}`,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        accuracy: finalCoords.accuracy,
        mediaUrls: mediaUrl
          ? [mediaUrl]
          : [
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
            ],
        isInfrastructureIssue: true,
      });

      setContent('');
      setMediaUrl('');
      setIsSubmitting(false);
    }, 350);
  };

  const samplePhotoPresets = [
    { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800' },
    { label: 'Pipeline Leak', url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800' },
    { label: 'Electric Wire', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden p-5 sm:p-6 shadow-2xl border border-[#E6EEE8] space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E6EEE8]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E9F8ED] text-[#087A45]">
              <AlertCircle className="w-5 h-5" />
            </span>
            <h3 className="font-extrabold text-base text-[#17251D]">{t.create.title}</h3>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-2 rounded-full hover:bg-[#F7FAF7] text-[#77847C]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Notice Badge */}
        <div className="p-3 bg-[#E9F8ED]/60 border border-[#32C878]/30 rounded-2xl flex items-start gap-2 text-xs text-[#064B2E]">
          <Sparkles className="w-4 h-4 text-[#087A45] mt-0.5 flex-shrink-0" />
          <span>{t.create.aiNotice}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.create.inputPlaceholder}
            rows={3}
            required
            className="w-full p-3.5 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-sm text-[#17251D] placeholder-[#77847C] outline-none focus:border-[#087A45] focus:bg-white transition-all resize-none"
          />

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17251D]">{t.create.category}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full p-3 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] text-xs font-medium text-[#17251D] outline-none focus:border-[#087A45]"
            >
              <option value="ROAD_TRANSPORT">{t.categories.ROAD_TRANSPORT}</option>
              <option value="WATER_SUPPLY">{t.categories.WATER_SUPPLY}</option>
              <option value="ELECTRICITY">{t.categories.ELECTRICITY}</option>
              <option value="DRAINAGE">{t.categories.DRAINAGE}</option>
              <option value="WASTE_MANAGEMENT">{t.categories.WASTE_MANAGEMENT}</option>
              <option value="PUBLIC_SAFETY">{t.categories.PUBLIC_SAFETY}</option>
              <option value="HEALTH_SANITATION">{t.categories.HEALTH_SANITATION}</option>
              <option value="OTHER">{t.categories.OTHER}</option>
            </select>
          </div>

          {/* Urgency Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#17251D]">{t.create.urgency}</label>
            <div className="grid grid-cols-4 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setUrgency(lvl)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    urgency === lvl
                      ? 'bg-[#087A45] text-white border-[#087A45] shadow-xs'
                      : 'bg-[#F7FAF7] text-[#77847C] border-[#E6EEE8] hover:bg-white'
                  }`}
                >
                  {t.urgency[lvl]}
                </button>
              ))}
            </div>
          </div>

          {/* REAL GPS & LOCATION SECTION */}
          <div className="space-y-2 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8] p-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17251D]">
                <MapPin className="w-4 h-4 text-[#087A45]" />
                <span>{language === 'ml' ? 'പ്രശ്നത്തിന്റെ സ്ഥലം (GPS)' : 'Issue Location (GPS & Address)'}</span>
              </div>

              {/* GPS Action Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsStatus === 'detecting'}
                className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 shadow-2xs ${
                  gpsStatus === 'detecting'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : gpsStatus === 'success'
                    ? 'bg-[#E9F8ED] border border-[#087A45]/40 text-[#087A45]'
                    : 'bg-[#087A45] text-white hover:bg-[#064B2E]'
                }`}
              >
                {gpsStatus === 'detecting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.create.detectingGps}</span>
                  </>
                ) : gpsStatus === 'success' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#087A45]" />
                    <span>{t.create.gpsDetected}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.create.useGps}</span>
                  </>
                )}
              </button>
            </div>

            {/* Location Status Card */}
            <div className="p-3 bg-white rounded-xl border border-[#E6EEE8] space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-[#17251D]">
                    {selectedLocality}, {selectedDistrict}
                  </span>
                  {coords && (
                    <div className="text-[11px] font-mono text-[#087A45] flex items-center gap-1.5 mt-0.5">
                      <Compass className="w-3 h-3 text-[#087A45]" />
                      <span>{coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E</span>
                      {coords.accuracy && (
                        <span className="text-[10px] text-[#77847C] bg-[#F7FAF7] px-1.5 py-0.5 rounded-md border border-[#E6EEE8]">
                          ±{coords.accuracy}m
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualEditOpen(!isManualEditOpen)}
                  className="text-xs text-[#087A45] hover:underline flex items-center gap-1 font-medium"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isManualEditOpen ? 'Done' : t.create.editLocation}</span>
                </button>
              </div>

              {/* Formatted address display */}
              {streetAddress && (
                <p className="text-[11px] text-[#77847C] line-clamp-2">
                  {streetAddress}
                </p>
              )}
            </div>

            {/* Error banner if GPS failed */}
            {gpsError && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Manual Location Fine-Tuning Drawer */}
            {isManualEditOpen && (
              <div className="p-3 bg-white rounded-xl border border-[#32C878]/40 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-semibold text-[#064B2E]">
                  {language === 'ml' ? 'പ്രദേശം തിരഞ്ഞെടുക്കുക അല്ലെങ്കിൽ മാറ്റുക:' : 'Fine-tune location details:'}
                </div>

                {/* Quick Kerala Locality Dropdown */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#77847C] font-semibold block mb-0.5">District</label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => {
                        const dist = e.target.value;
                        setSelectedDistrict(dist);
                        const firstLocInDist = EXTENDED_KERALA_LOCALITIES.find((l) => l.district === dist);
                        if (firstLocInDist) {
                          handleLocalitySelect(firstLocInDist.name);
                        }
                      }}
                      className="w-full p-2 bg-[#F7FAF7] border border-[#E6EEE8] rounded-xl text-xs text-[#17251D] outline-none"
                    >
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#77847C] font-semibold block mb-0.5">Town / Locality</label>
                    <select
                      value={selectedLocality}
                      onChange={(e) => handleLocalitySelect(e.target.value)}
                      className="w-full p-2 bg-[#F7FAF7] border border-[#E6EEE8] rounded-xl text-xs text-[#17251D] outline-none"
                    >
                      {EXTENDED_KERALA_LOCALITIES.filter((l) => l.district === selectedDistrict).map((l) => (
                        <option key={l.name} value={l.name}>
                          {l.name} ({l.pincode})
                        </option>
                      ))}
                      {/* Allow custom locality if not in list */}
                      {!EXTENDED_KERALA_LOCALITIES.some((l) => l.name === selectedLocality) && (
                        <option value={selectedLocality}>{selectedLocality}</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Specific street / landmark input */}
                <div>
                  <label className="text-[10px] text-[#77847C] font-semibold block mb-0.5">
                    {language === 'ml' ? 'ലാൻഡ്മാർക്ക് / റോഡിന്റെ പേര്:' : 'Landmark / Street / Junction:'}
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder={t.create.landmarkPlaceholder}
                    className="w-full p-2 bg-[#F7FAF7] border border-[#E6EEE8] rounded-xl text-xs text-[#17251D] placeholder-[#77847C] outline-none focus:border-[#087A45]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Photo Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#77847C]">
              <Camera className="w-3.5 h-3.5 text-[#087A45]" />
              <span>{t.create.addPhotos}</span>
            </div>
            <div className="flex items-center gap-2">
              {samplePhotoPresets.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setMediaUrl(preset.url)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    mediaUrl === preset.url
                      ? 'bg-[#E9F8ED] border-[#087A45] text-[#087A45] font-semibold'
                      : 'bg-white border-[#E6EEE8] text-[#17251D] hover:bg-[#F7FAF7]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#087A45] text-white font-bold text-sm shadow-md shadow-[#087A45]/30 hover:bg-[#064B2E] transition-all disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? 'Submitting to Naatukoottam...' : t.create.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
