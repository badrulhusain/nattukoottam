'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Send,
  UploadCloud,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { IssueCategory, UrgencyLevel } from '../../types';
import {
  getCurrentGpsPosition,
  reverseGeocodeCoordinates,
  EXTENDED_KERALA_LOCALITIES,
  KERALA_DISTRICTS,
} from '../../lib/geolocation';
import { createLivePostApi, createLiveIssueApi, uploadMediaApi } from '../../lib/api';

interface CreatePostModalProps {
  autoDetectGps?: boolean;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = () => {
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
    setIsAuthModalOpen,
  } = useAppStore();
  const t = getT(language);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<IssueCategory>('ROAD_TRANSPORT');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [mediaUrl, setMediaUrl] = useState('');
  const [postType, setPostType] = useState<'grievance' | 'community'>('grievance');

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

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

      // Update global app state
      setUserLocation(detected);
      setLocality(detected.locality);
      setGpsStatus('success');
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      setGpsStatus('error');
      let msg = t.create.gpsError;
      if (err?.code === 1) {
        msg =
          language === 'ml'
            ? 'ലൊക്കേഷൻ അനുമതി നൽകിയിട്ടില്ല. താഴെ നിങ്ങളുടെ സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.'
            : 'Location permission was denied. Please select your locality manually below.';
      } else if (err?.code === 3) {
        msg =
          language === 'ml'
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(
        language === 'ml'
          ? 'ദയവായി ഒരു ചിത്രം (JPG, PNG, WEBP) തിരഞ്ഞെടുക്കുക'
          : 'Please select a valid image file (JPG, PNG, WEBP)'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError(
        language === 'ml'
          ? 'ചിത്രത്തിന്റെ വലുപ്പം 10MB-ൽ കുറവായിരിക്കണം'
          : 'Image size must be less than 10MB'
      );
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const res = await uploadMediaApi(file);
      if (res && res.url) {
        setMediaUrl(res.url);
      } else {
        throw new Error('Upload completed without returning an image URL');
      }
    } catch (err: any) {
      console.error('Cloudinary upload failed:', err);
      setUploadError(
        err.message ||
          (language === 'ml'
            ? 'ക്ലൗഡിനറിയിലേക്ക് ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യാൻ കഴിഞ്ഞില്ല'
            : 'Failed to upload photo to Cloudinary')
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!currentUser || currentUser.id === 'guest' || !currentUser.id) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    setIsSubmitting(true);

    let finalCoords = coords;
    if (!finalCoords) {
      const found =
        EXTENDED_KERALA_LOCALITIES.find(
          (l) => l.name.toLowerCase() === selectedLocality.toLowerCase()
        ) || EXTENDED_KERALA_LOCALITIES[0];
      finalCoords = { lat: found.lat, lng: found.lng, accuracy: 100 };
    }

    const formattedAddress = streetAddress || `${selectedLocality}, ${selectedDistrict}`;

    try {
      let createdId: string | undefined;

      if (postType === 'grievance') {
        const title =
          content.split('\n')[0].slice(0, 80).trim() ||
          (language === 'ml' ? 'നാട്ടുകൂട്ടം പരാതി' : 'Civic Issue');

        const res = await createLiveIssueApi({
          title,
          description: content,
          category,
          urgency,
          district: selectedDistrict,
          locality: selectedLocality,
          address: formattedAddress,
          latitude: finalCoords.lat,
          longitude: finalCoords.lng,
          evidenceUrls: mediaUrl ? [mediaUrl] : [],
        });
        createdId = res?.id;
      } else {
        const res = await createLivePostApi({
          content,
          category,
          locality: selectedLocality,
          district: selectedDistrict,
          latitude: finalCoords.lat,
          longitude: finalCoords.lng,
          mediaUrls: mediaUrl ? [mediaUrl] : [],
          language: language || 'ml',
        });
        createdId = res?.id;
      }

      addPost({
        id: createdId || `post_${Date.now()}`,
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
        address: formattedAddress,
        latitude: finalCoords.lat,
        longitude: finalCoords.lng,
        accuracy: finalCoords.accuracy,
        mediaUrls: mediaUrl ? [mediaUrl] : [],
        isInfrastructureIssue: postType === 'grievance',
      });

      setContent('');
      setMediaUrl('');
      setIsCreateModalOpen(false);
    } catch (err: any) {
      console.error('Post submission error:', err);
      alert(
        err.message ||
          (language === 'ml'
            ? 'പരാതി സമർപ്പിക്കാൻ കഴിഞ്ഞില്ല. ദയവായി കണക്ഷൻ പരിശോധിക്കുക.'
            : 'Failed to submit report. Please check your network connection.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden p-5 sm:p-6 shadow-2xl border border-[#E4EBE6] space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E4EBE6]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF7EF] text-[#16A34A]">
              <AlertCircle className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-extrabold text-base text-[#17251D]">{t.create.title}</h3>
              <p className="text-[11px] text-[#718078]">
                {language === 'ml' ? 'വാർഡിലെ വിവരങ്ങൾ ജനങ്ങളിലേക്ക്' : 'Publish to your local ward community'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(false)}
            className="p-1.5 rounded-xl text-[#718078] hover:text-[#17251D] hover:bg-[#F8FAF8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Post Type Selector (Grievance vs Community Discussion) */}
        <div className="flex items-center bg-[#F8FAF8] p-1 rounded-xl border border-[#E4EBE6]">
          <button
            type="button"
            onClick={() => setPostType('grievance')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              postType === 'grievance'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-[#718078] hover:text-[#17231D]'
            }`}
          >
            {language === 'ml' ? 'പരാതി റിപ്പോർട്ട്' : 'Civic Grievance'}
          </button>
          <button
            type="button"
            onClick={() => setPostType('community')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              postType === 'community'
                ? 'bg-white text-[#16A34A] shadow-xs'
                : 'text-[#718078] hover:text-[#17231D]'
            }`}
          >
            {language === 'ml' ? 'പൊതുവിവരം / ചർച്ച' : 'Community Discussion'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Text Area */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.create.inputPlaceholder}
            rows={3}
            required
            className="w-full p-3.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] text-xs text-[#17251D] placeholder-[#718078] outline-none focus:border-[#16A34A] focus:bg-white transition-all resize-none"
          />

          {/* Category Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17251D]">{t.create.category}</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as IssueCategory)}
              className="w-full p-2.5 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] text-xs font-medium text-[#17251D] outline-none focus:border-[#16A34A]"
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
          {postType === 'grievance' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#17251D]">{t.create.urgency}</label>
              <div className="grid grid-cols-4 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const).map((lvl) => (
                  <button
                    type="button"
                    key={lvl}
                    onClick={() => setUrgency(lvl)}
                    className={`py-1.5 text-xs font-bold rounded-xl border transition-all active-press ${
                      urgency === lvl
                        ? lvl === 'CRITICAL'
                          ? 'bg-red-50 text-red-700 border-red-300 shadow-xs'
                          : lvl === 'HIGH'
                          ? 'bg-orange-50 text-orange-700 border-orange-300 shadow-xs'
                          : 'bg-[#EAF7EF] text-[#16A34A] border-[#D1EBD9] shadow-xs'
                        : 'bg-[#F8FAF8] text-[#718078] border-[#E4EBE6] hover:bg-white'
                    }`}
                  >
                    {t.urgency[lvl]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Location & GPS Panel */}
          <div className="space-y-2 rounded-xl bg-[#F8FAF8] border border-[#E4EBE6] p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#17251D]">
                <MapPin className="w-4 h-4 text-[#16A34A]" />
                <span>
                  {language === 'ml' ? 'വാർഡ് ലൊക്കേഷൻ (GPS)' : 'Ward & Geotag'}
                </span>
              </div>

              {/* GPS Action Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={gpsStatus === 'detecting'}
                className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 active-press ${
                  gpsStatus === 'detecting'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : gpsStatus === 'success'
                    ? 'bg-[#EAF7EF] border border-[#D1EBD9] text-[#16A34A]'
                    : 'bg-[#16A34A] text-white hover:bg-[#15803D]'
                }`}
              >
                {gpsStatus === 'detecting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.create.detectingGps}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {gpsStatus === 'success'
                        ? t.create.gpsDetected
                        : t.create.useMyLiveLocation}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* Current Geotag Pill */}
            <div className="bg-white rounded-lg p-2 border border-[#E4EBE6] space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#17251D]">
                    {selectedLocality}, {selectedDistrict}
                  </span>
                  {coords?.accuracy && (
                    <div className="flex items-center gap-1 text-[10px] text-[#16A34A] bg-[#EAF7EF] px-1.5 py-0.5 rounded">
                      <Compass className="w-3 h-3" />
                      <span>
                        ±{coords.accuracy}m
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualEditOpen(!isManualEditOpen)}
                  className="text-xs text-[#16A34A] hover:underline flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>{isManualEditOpen ? 'Done' : t.create.editLocation}</span>
                </button>
              </div>

              {streetAddress && (
                <p className="text-[10px] text-[#718078] line-clamp-1">{streetAddress}</p>
              )}
            </div>

            {/* Error banner if GPS failed */}
            {gpsError && (
              <div className="p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* Manual Location Fine-Tuning Drawer */}
            {isManualEditOpen && (
              <div className="p-2.5 bg-white rounded-lg border border-[#D1EBD9] space-y-2 animate-in fade-in duration-150">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[#718078] font-bold block mb-0.5">District</label>
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
                      className="w-full p-1.5 bg-[#F8FAF8] border border-[#E4EBE6] rounded-lg text-xs text-[#17251D] outline-none"
                    >
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#718078] font-bold block mb-0.5">Town / Locality</label>
                    <select
                      value={selectedLocality}
                      onChange={(e) => handleLocalitySelect(e.target.value)}
                      className="w-full p-1.5 bg-[#F8FAF8] border border-[#E4EBE6] rounded-lg text-xs text-[#17251D] outline-none"
                    >
                      {EXTENDED_KERALA_LOCALITIES.filter((l) => l.district === selectedDistrict).map((l) => (
                        <option key={l.name} value={l.name}>
                          {l.name} ({l.pincode})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[#718078] font-bold block mb-0.5">
                    {language === 'ml' ? 'ലാൻഡ്മാർക്ക് / റോഡിന്റെ പേര്:' : 'Landmark / Junction:'}
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder={t.create.landmarkPlaceholder}
                    className="w-full p-1.5 bg-[#F8FAF8] border border-[#E4EBE6] rounded-lg text-xs text-[#17251D] placeholder-[#718078] outline-none focus:border-[#16A34A]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Media Attachments - Cloudinary Functional Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#17251D]">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#16A34A]" />
                <span>{t.create.addPhotos}</span>
              </div>
              <span className="text-[10px] text-[#718078] font-normal">
                {language === 'ml' ? 'ക്ലൗഡിനറി സുരക്ഷിത സംഭരണം' : 'Cloudinary Secure Storage'}
              </span>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* When Uploading */}
            {isUploading && (
              <div className="p-4 rounded-xl border border-dashed border-[#16A34A] bg-[#EAF7EF]/50 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-[#16A34A] animate-spin" />
                <p className="text-xs font-bold text-[#16A34A]">
                  {language === 'ml' ? 'ക്ലൗഡിനറിയിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നു...' : 'Uploading to Cloudinary...'}
                </p>
                <p className="text-[10px] text-[#718078]">
                  {language === 'ml' ? 'തെളിവ് ഫോട്ടോ ഒപ്റ്റിമൈസ് ചെയ്യുന്നു' : 'Optimizing and securing evidence photo'}
                </p>
              </div>
            )}

            {/* Upload Error Banner */}
            {uploadError && (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{uploadError}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="text-red-500 hover:text-red-700 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* When Image is Present (Preview) */}
            {!isUploading && mediaUrl && (
              <div className="relative rounded-xl border border-[#D1EBD9] overflow-hidden bg-slate-50 group">
                <img
                  src={mediaUrl}
                  alt="Uploaded Evidence"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-[#16A34A]" />
                  <span>Cloudinary Verified</span>
                </div>
                <div className="absolute top-2 right-2 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-xs font-bold text-[#17251D] shadow-sm backdrop-blur-xs transition-all"
                  >
                    {language === 'ml' ? 'മാറ്റുക' : 'Change'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMediaUrl('')}
                    className="p-1 rounded-lg bg-red-600/90 hover:bg-red-600 text-white shadow-sm backdrop-blur-xs transition-all"
                    title="Remove photo"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* When No Image & Not Uploading */}
            {!isUploading && !mediaUrl && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 px-3 rounded-xl border-2 border-dashed border-[#D1EBD9] hover:border-[#16A34A] bg-[#F8FAF8] hover:bg-[#EAF7EF]/40 transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer group active-press"
                >
                  <div className="p-2.5 rounded-full bg-white shadow-xs group-hover:scale-110 transition-transform">
                    <Camera className="w-5 h-5 text-[#16A34A]" />
                  </div>
                  <p className="text-xs font-bold text-[#17251D]">
                    {language === 'ml' ? 'ക്യാമറ തുറക്കുക അല്ലെങ്കിൽ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക' : 'Take Photo or Choose from Device'}
                  </p>
                  <p className="text-[10px] text-[#718078]">
                    {language === 'ml' ? 'ക്ലൗഡിനറി ക്ലൗഡിലേക്ക് നേരിട്ട് അപ്‌ലോഡ് ആകും (10MB വരെ)' : 'Uploaded directly to Cloudinary (PNG, JPG, WEBP up to 10MB)'}
                  </p>
                </button>

                {/* Alternative: Enter URL toggle */}
                <div className="flex items-center justify-between pt-0.5">
                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="text-[11px] text-[#718078] hover:text-[#16A34A] font-semibold underline underline-offset-2"
                  >
                    {showUrlInput
                      ? (language === 'ml' ? 'ഫോട്ടോ തിരഞ്ഞെടുക്കലിലേക്ക് മടങ്ങുക' : 'Hide URL input')
                      : (language === 'ml' ? 'അല്ലെങ്കിൽ ഫോട്ടോ ലിങ്ക് (URL) നേരിട്ട് നൽകുക' : 'Or paste an image web URL')}
                  </button>
                </div>

                {showUrlInput && (
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://... image link"
                    className="w-full p-2 bg-[#F8FAF8] border border-[#E4EBE6] rounded-xl text-xs text-[#17251D] outline-none focus:border-[#16A34A]"
                  />
                )}
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-md shadow-[#16A34A]/20 transition-all disabled:opacity-50 active-press flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : t.create.submit}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
