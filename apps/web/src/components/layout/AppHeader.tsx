'use client';

import React, { useState } from 'react';
import { MapPin, Search, Bell, Menu, Globe, Navigation, Loader2 } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { EXTENDED_KERALA_LOCALITIES } from '../../lib/geolocation';
import { getCurrentGpsPosition, reverseGeocodeCoordinates } from '../../lib/geolocation';

export const AppHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    currentLocality,
    setLocality,
    setUserLocation,
    setIsOnboardingOpen,
    setActiveTab,
  } = useAppStore();
  const t = getT(language);

  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const handleHeaderGpsDetect = async () => {
    setIsDetectingGps(true);
    try {
      const pos = await getCurrentGpsPosition();
      const detected = await reverseGeocodeCoordinates(
        pos.coords.latitude,
        pos.coords.longitude,
        pos.coords.accuracy
      );
      setUserLocation(detected);
      setLocality(detected.locality);
      setIsLocalityDropdownOpen(false);
    } catch (err) {
      console.warn('GPS detection failed from header:', err);
      alert(
        language === 'ml'
          ? 'GPS ലഭ്യമായില്ല. അനുമതി നൽകുകയോ താഴെയുള്ള പട്ടികയിൽ നിന്ന് തിരഞ്ഞെടുക്കുകയോ ചെയ്യുക.'
          : 'Could not acquire GPS. Please ensure location permissions are enabled.'
      );
    } finally {
      setIsDetectingGps(false);
    }
  };

  const filteredLocalities = EXTENDED_KERALA_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.pincode.includes(searchQuery)
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E6EEE8] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand Icon / Mobile Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="p-2 -ml-1 rounded-full text-[#17251D] hover:bg-[#E9F8ED] transition-colors"
            title="Open Welcome Info"
          >
            <Menu className="w-5 h-5 text-[#087A45]" />
          </button>
          <span className="font-bold text-lg text-[#087A45] tracking-tight hidden sm:inline">
            {t.appName}
          </span>
        </div>

        {/* Center: Locality Pill Selector */}
        <div className="relative">
          <button
            onClick={() => setIsLocalityDropdownOpen(!isLocalityDropdownOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E9F8ED] text-[#064B2E] text-sm font-medium hover:bg-[#d8f2de] transition-colors shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#087A45]" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{currentLocality}</span>
            <span className="text-xs text-[#087A45] opacity-75">▾</span>
          </button>

          {/* Locality Dropdown */}
          {isLocalityDropdownOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-[#E6EEE8] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[11px] font-bold text-[#77847C] uppercase tracking-wider">
                  {language === 'ml' ? 'പ്രദേശം മാറ്റുക' : 'Select Kerala Locality'}
                </span>
                <button
                  onClick={() => setIsLocalityDropdownOpen(false)}
                  className="text-xs text-[#77847C] hover:text-[#17251D]"
                >
                  ✕
                </button>
              </div>

              {/* Live GPS Detection Button */}
              <button
                type="button"
                onClick={handleHeaderGpsDetect}
                disabled={isDetectingGps}
                className="w-full py-2 px-3 rounded-xl bg-[#087A45] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs hover:bg-[#064B2E] transition-all disabled:opacity-75"
              >
                {isDetectingGps ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{language === 'ml' ? 'GPS പരിശോധിക്കുന്നു...' : 'Acquiring GPS...'}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t.create.useMyLiveLocation}</span>
                  </>
                )}
              </button>

              {/* Search Filter */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#77847C] absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'ml' ? 'സ്ഥലം തിരയുക...' : 'Search place, district, pin...'}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#F7FAF7] border border-[#E6EEE8] rounded-xl text-xs text-[#17251D] placeholder-[#77847C] outline-none focus:border-[#087A45]"
                />
              </div>

              {/* List of localities */}
              <div className="max-h-56 overflow-y-auto no-scrollbar space-y-1">
                {filteredLocalities.slice(0, 15).map((loc) => (
                  <button
                    key={`${loc.name}-${loc.district}`}
                    onClick={() => {
                      setLocality(loc.name);
                      setUserLocation({
                        latitude: loc.lat,
                        longitude: loc.lng,
                        accuracy: 50,
                        locality: loc.name,
                        district: loc.district,
                        state: 'Kerala',
                        formattedAddress: `${loc.name}, ${loc.district}, Kerala (${loc.pincode})`,
                        pincode: loc.pincode,
                      });
                      setIsLocalityDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs flex items-center justify-between hover:bg-[#F7FAF7] transition-colors ${
                      currentLocality === loc.name
                        ? 'text-[#087A45] font-bold bg-[#E9F8ED]'
                        : 'text-[#17251D]'
                    }`}
                  >
                    <span>{loc.name}</span>
                    <span className="text-[10px] text-[#77847C]">{loc.district}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Language switch, Search & Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bilingual Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border border-[#E6EEE8] text-[#17251D] hover:bg-[#F7FAF7] transition-colors"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#087A45]" />
            <span>{language === 'en' ? 'മല' : 'EN'}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="p-2 rounded-full text-[#17251D] hover:bg-[#F7FAF7] transition-colors relative"
            title={t.nav.notifications}
          >
            <Bell className="w-5 h-5 text-[#17251D]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E53E3E] ring-2 ring-white" />
          </button>
        </div>
      </div>
    </header>
  );
};
