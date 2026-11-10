'use client';

import React, { useState } from 'react';
import { X, Camera, MapPin, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { IssueCategory, UrgencyLevel } from '../../types';

export const CreatePostModal: React.FC = () => {
  const { isCreateModalOpen, setIsCreateModalOpen, language, currentLocality, addPost, currentUser } = useAppStore();
  const t = getT(language);

  const [content, setContent] = useState('');
  const [category, setCategory] = useState<IssueCategory>('ROAD_TRANSPORT');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [mediaUrl, setMediaUrl] = useState('');
  const [gpsDetected, setGpsDetected] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCreateModalOpen) return null;

  const handleDetectGps = () => {
    setGpsDetected(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addPost({
        author: {
          id: currentUser.id,
          fullName: currentUser.fullName,
          username: currentUser.username,
          avatarUrl: currentUser.avatarUrl,
          locality: currentLocality,
        },
        content,
        category,
        urgency,
        locality: currentLocality,
        district: currentUser.district,
        mediaUrls: mediaUrl
          ? [mediaUrl]
          : [
              'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
            ],
        isInfrastructureIssue: true,
      });

      setContent('');
      setMediaUrl('');
      setGpsDetected(false);
      setIsSubmitting(false);
    }, 400);
  };

  const samplePhotoPresets = [
    { label: 'Pothole', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800' },
    { label: 'Pipeline Leak', url: 'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800' },
    { label: 'Electric Wire', url: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden p-5 sm:p-6 shadow-2xl border border-[#E6EEE8] space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
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

        {/* AI Insight Badge */}
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
            rows={4}
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

          {/* Location & GPS */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F7FAF7] border border-[#E6EEE8]">
            <div className="flex items-center gap-2 text-xs text-[#17251D]">
              <MapPin className="w-4 h-4 text-[#087A45]" />
              <span className="font-semibold">{currentLocality}, Kerala</span>
            </div>
            <button
              type="button"
              onClick={handleDetectGps}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors flex items-center gap-1 ${
                gpsDetected ? 'bg-emerald-100 text-emerald-800' : 'bg-white border border-[#E6EEE8] text-[#087A45]'
              }`}
            >
              {gpsDetected ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.create.gpsDetected}</span>
                </>
              ) : (
                <span>{t.create.useGps}</span>
              )}
            </button>
          </div>

          {/* Quick Photo Presets */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1 text-xs font-semibold text-[#77847C]">
              <Camera className="w-3.5 h-3.5 text-[#087A45]" />
              <span>{t.create.addPhotos} (Attach Photo)</span>
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

