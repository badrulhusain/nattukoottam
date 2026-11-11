'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  Sparkles,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { uploadMediaApi } from '../../lib/api';
import { EXTENDED_KERALA_LOCALITIES } from '../../lib/geolocation';

export const AddStoryModal: React.FC = () => {
  const {
    isAddStoryOpen,
    setIsAddStoryOpen,
    addStory,
    language,
    currentLocality,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
  } = useAppStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedLocality, setSelectedLocality] = useState(currentLocality || 'Kakkanad');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isAddStoryOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError(
        language === 'ml'
          ? 'ദയവായി ഒരു ചിത്രം തിരഞ്ഞെടുക്കുക (JPG, PNG, WEBP)'
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
        throw new Error('Upload completed without an image URL');
      }
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      setUploadError(
        err.message ||
          (language === 'ml'
            ? 'ഫോട്ടോ അപ്‌ലോഡ് പരാജയപ്പെട്ടു'
            : 'Failed to upload photo to Cloudinary')
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handlePostStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    if (!currentUser || currentUser.id === 'guest' || !currentUser.id) {
      setIsAuthModalOpen(true, 'login');
      return;
    }

    addStory({
      mediaUrl,
      caption: caption.trim(),
      locality: selectedLocality,
    });

    setMediaUrl('');
    setCaption('');
    setIsAddStoryOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden p-5 shadow-2xl border border-[#E4EBE6] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#E4EBE6]">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 text-white shadow-xs">
              <Camera className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-extrabold text-sm text-[#17251D]">
                {language === 'ml' ? 'സ്റ്റോറി പങ്കിടുക' : 'Create Instagram Story'}
              </h3>
              <p className="text-[11px] text-[#718078]">
                {language === 'ml'
                  ? 'നിങ്ങളുടെ വാർഡിലെ തത്സമയ കാഴ്ചകൾ'
                  : 'Share a 24h photo update to your ward'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAddStoryOpen(false)}
            className="p-1.5 rounded-xl text-[#718078] hover:text-[#17251D] hover:bg-[#F8FAF8] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Upload Dropzone / Preview */}
        {isUploading ? (
          <div className="h-64 rounded-xl border border-dashed border-[#16A34A] bg-[#EAF7EF]/40 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-7 h-7 text-[#16A34A] animate-spin" />
            <p className="text-xs font-bold text-[#16A34A]">
              {language === 'ml' ? 'ക്ലൗഡിനറിയിലേക്ക് അപ്‌ലോഡ് ചെയ്യുന്നു...' : 'Uploading to Cloudinary...'}
            </p>
            <p className="text-[10px] text-[#718078]">
              {language === 'ml' ? 'സ്റ്റോറി തയ്യാറാകുന്നു' : 'Processing image securely'}
            </p>
          </div>
        ) : mediaUrl ? (
          <div className="relative rounded-xl overflow-hidden aspect-4/5 bg-black group border border-[#D1EBD9]">
            <img
              src={mediaUrl}
              alt="Story Preview"
              className="w-full h-full object-cover"
            />
            {caption && (
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white text-xs font-medium">
                {caption}
              </div>
            )}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] text-white font-semibold flex items-center gap-1">
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
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-56 rounded-xl border-2 border-dashed border-[#D1EBD9] hover:border-[#16A34A] bg-[#F8FAF8] hover:bg-[#EAF7EF]/30 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer group active-press"
          >
            <div className="p-3.5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-emerald-500 text-white shadow-md group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-[#17251D]">
              {language === 'ml' ? 'ക്യാമറ തുറക്കുക അല്ലെങ്കിൽ ഫോട്ടോ എടുക്കുക' : 'Take Photo or Choose from Device'}
            </p>
            <p className="text-[10px] text-[#718078]">
              {language === 'ml' ? 'ക്ലൗഡിനറി ക്ലൗഡിലേക്ക് നേരിട്ട് അപ്‌ലോഡ് ആകുന്നു' : 'Uploads directly to Cloudinary'}
            </p>
          </button>
        )}

        {/* Error Alert */}
        {uploadError && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Caption & Locality Input */}
        <form onSubmit={handlePostStory} className="space-y-3">
          <div>
            <label className="text-[11px] font-bold text-[#718078] block mb-1">
              {language === 'ml' ? 'വിവരണം / അടിക്കുറിപ്പ് (ഓപ്ഷണൽ)' : 'Caption (Optional)'}
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={120}
              placeholder={
                language === 'ml'
                  ? 'ഉദാ: കാക്കനാട് മെയിൻ റോഡ് നവീകരണം നടക്കുന്നു... 📸'
                  : 'e.g. Kakkanad junction view today... 📸'
              }
              className="w-full p-2.5 bg-[#F8FAF8] border border-[#E4EBE6] rounded-xl text-xs text-[#17251D] outline-none focus:border-[#16A34A]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#718078]">
              <MapPin className="w-3.5 h-3.5 text-[#16A34A]" />
              <span className="font-semibold">{selectedLocality}</span>
            </div>

            <button
              type="submit"
              disabled={!mediaUrl || isUploading}
              className="py-2 px-4 rounded-xl bg-gradient-to-tr from-emerald-600 to-[#16A34A] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-[#16A34A]/20 transition-all disabled:opacity-50 flex items-center gap-1.5 active-press"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{language === 'ml' ? 'സ്റ്റോറി പങ്കിടുക' : 'Share Story'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

