'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Loader2,
  Check,
  User as UserIcon,
  MapPin,
  Mail,
  Phone,
  FileText,
  Languages,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { updateUserProfileApi, uploadMediaApi } from '../../lib/api';
import { KERALA_DISTRICTS, EXTENDED_KERALA_LOCALITIES, saveLocationToStorage } from '../../lib/geolocation';
import { UserAvatar } from '../ui/UserAvatar';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, login, language, setLocality, setUserLocation } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [district, setDistrict] = useState(currentUser.district || 'Ernakulam');
  const [locality, setLocalityState] = useState(currentUser.locality || 'Kakkanad');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [preferredLang, setPreferredLang] = useState<'ml' | 'en'>(currentUser.preferredLang || 'ml');

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFullName(currentUser.fullName || '');
      setBio(currentUser.bio || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setDistrict(currentUser.district || 'Ernakulam');
      setLocalityState(currentUser.locality || 'Kakkanad');
      setPhone(currentUser.phone || '');
      setEmail(currentUser.email || '');
      setPreferredLang(currentUser.preferredLang || 'ml');
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Filter localities by selected district
  const filteredLocalities = EXTENDED_KERALA_LOCALITIES.filter(
    (loc) => loc.district.toLowerCase() === district.toLowerCase()
  );

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(language === 'ml' ? 'ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക' : 'Please select an image file');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg(language === 'ml' ? 'ചിത്രത്തിന്റെ വലുപ്പം 8MB-ൽ കുറവായിരിക്കണം' : 'Image size must be under 8MB');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await uploadMediaApi(file);
      if (res && res.url) {
        setAvatarUrl(res.url);
      }
    } catch (err: any) {
      console.error('Avatar upload failed:', err);
      setErrorMsg(err.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg(language === 'ml' ? 'പേര് നൽകേണ്ടതുണ്ട്' : 'Full Name is required');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      // 1. Update in Neon backend DB
      const updatedUser = await updateUserProfileApi({
        fullName: fullName.trim(),
        bio: bio.trim(),
        avatarUrl: avatarUrl.trim(),
        locality: locality.trim(),
        district,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        preferredLang,
      });

      // 2. Update store state
      login({
        ...currentUser,
        fullName: updatedUser.fullName || fullName.trim(),
        bio: bio.trim(),
        avatarUrl: updatedUser.avatarUrl || avatarUrl.trim(),
        locality: updatedUser.locality || locality.trim(),
        district: updatedUser.district || district,
        email: updatedUser.email || email.trim(),
        phone: updatedUser.phone || phone.trim(),
        preferredLang,
      });

      // 3. Update location if locality changed
      if (locality.trim() !== currentUser.locality) {
        setLocality(locality.trim());
        saveLocationToStorage({
          latitude: 10.0159,
          longitude: 76.3419,
          accuracy: 50,
          locality: locality.trim(),
          district,
          state: 'Kerala',
          formattedAddress: `${locality.trim()}, ${district}, Kerala`,
        });
      }

      setSuccessMsg(language === 'ml' ? 'പ്രൊഫൈൽ വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!' : 'Profile updated successfully!');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl border border-[#E4EBE6] flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4EBE6]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#EAF7EF] text-[#16A34A]">
              <UserIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-[#17231D]">
                {language === 'ml' ? 'പ്രൊഫൈൽ എഡിറ്റ് ചെയ്യുക' : 'Edit Profile'}
              </h3>
              <p className="text-[11px] text-[#718078]">
                {language === 'ml' ? 'നിങ്ങളുടെ വ്യക്തിഗത വിവരങ്ങളും വാർഡും മാറ്റുക' : 'Update your personal details & ward location'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-200 font-bold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Avatar Photo Section */}
          <div className="flex items-center gap-4 p-3.5 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6]">
            <div className="relative group">
              <UserAvatar
                src={avatarUrl}
                name={fullName || 'Citizen'}
                size="lg"
                className="ring-2 ring-[#16A34A]/40 shadow-xs"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                {isUploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex-1 space-y-1">
              <span className="text-xs font-bold text-[#17231D] block">
                {language === 'ml' ? 'പ്രൊഫൈൽ ഫോട്ടോ' : 'Profile Picture'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1 rounded-lg bg-white border border-[#E4EBE6] hover:bg-zinc-50 text-[11px] font-bold text-[#16A34A] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>{isUploading ? 'Uploading...' : language === 'ml' ? 'ഫോട്ടോ മാറ്റുക' : 'Upload Photo'}</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-[11px] text-red-600 hover:underline cursor-pointer"
                  >
                    {language === 'ml' ? 'നീക്കംചെയ്യുക' : 'Remove'}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
              <span>{language === 'ml' ? 'പൂർണ്ണ നാമം' : 'Full Name'}</span>
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Badrul Husain"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors"
            />
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#17231D]">
              {language === 'ml' ? 'ബയോ (നിങ്ങളെക്കുറിച്ച്)' : 'Bio / Description'}
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={language === 'ml' ? 'നിങ്ങളുടെ വാർഡിലെ പ്രവർത്തനങ്ങൾ...' : 'Active resident interested in civic roads & waste management...'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* District & Locality Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* District */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'ജില്ല' : 'District'}</span>
              </label>
              <select
                value={district}
                onChange={(e) => {
                  const newDist = e.target.value;
                  setDistrict(newDist);
                  // pick first matching locality
                  const locs = EXTENDED_KERALA_LOCALITIES.filter(
                    (l) => l.district.toLowerCase() === newDist.toLowerCase()
                  );
                  if (locs.length > 0) {
                    setLocalityState(locs[0].name);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors cursor-pointer"
              >
                {KERALA_DISTRICTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Locality */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'പ്രദേശം / വാർഡ്' : 'Locality / Ward'}</span>
              </label>
              <div className="relative">
                {filteredLocalities.length > 0 ? (
                  <select
                    value={locality}
                    onChange={(e) => setLocalityState(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors cursor-pointer"
                  >
                    {filteredLocalities.map((loc) => (
                      <option key={loc.name} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocalityState(e.target.value)}
                    placeholder="Enter locality / ward"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Details (Phone & Email) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'ഫോൺ നമ്പർ' : 'Phone'}</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#16A34A]" />
                <span>{language === 'ml' ? 'ഇമെയിൽ' : 'Email'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2 rounded-xl border border-[#E4EBE6] bg-[#F8FAF8] text-xs font-medium text-[#17231D] focus:border-[#16A34A] focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Preferred Language */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-bold text-[#17231D] flex items-center gap-1">
              <Languages className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>{language === 'ml' ? 'ഇഷ്ടപ്പെട്ട ഭാഷ' : 'Preferred Language'}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreferredLang('ml')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'ml'
                    ? 'bg-[#EAF7EF] text-[#16A34A] border-[#16A34A]'
                    : 'bg-[#F8FAF8] text-[#718078] border-[#E4EBE6] hover:bg-zinc-100'
                }`}
              >
                മലയാളം (Malayalam)
              </button>
              <button
                type="button"
                onClick={() => setPreferredLang('en')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  preferredLang === 'en'
                    ? 'bg-[#EAF7EF] text-[#16A34A] border-[#16A34A]'
                    : 'bg-[#F8FAF8] text-[#718078] border-[#E4EBE6] hover:bg-zinc-100'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 border-t border-[#E4EBE6] bg-[#F8FAF8]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#718078] hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            {language === 'ml' ? 'റദ്ദാക്കുക' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="px-5 py-2 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : language === 'ml' ? 'മാറ്റങ്ങൾ സേവ് ചെയ്യുക' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

