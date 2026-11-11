'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Bell,
  Globe,
  Navigation,
  Loader2,
  Sparkles,
  ChevronDown,
  Info,
  Check,
  X,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { getT } from '../../lib/translations';
import { EXTENDED_KERALA_LOCALITIES } from '../../lib/geolocation';
import { getCurrentGpsPosition, reverseGeocodeCoordinates } from '../../lib/geolocation';
import { UserAvatar } from '../ui/UserAvatar';

export const AppHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    currentLocality,
    setLocality,
    setUserLocation,
    setIsOnboardingOpen,
    setActiveTab,
    currentUser,
    isAuthenticated,
    setIsAuthModalOpen,
    logout,
  } = useAppStore();
  const t = getT(language);

  const [isLocalityDropdownOpen, setIsLocalityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
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
          ? 'GPS ലഭ്യമായില്ല. ബ്രൗസർ ലൊക്കേഷൻ അനുമതി നൽകുക.'
          : 'Could not acquire GPS location. Please check browser permissions.'
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E4EBE6] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-15 flex items-center justify-between gap-2 sm:gap-6">
        {/* Brand Logo & Mobile Trigger */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
            title="Naatukoottam Community Hub"
          >
            {/* Custom Brand Icon: Kerala Community Knot / Palm Leaf */}
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#16A34A] to-[#15803D] flex items-center justify-center text-white shadow-sm shadow-[#16A34A]/25 transition-transform group-hover:scale-105 active-press">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[17px] text-[#17231D] tracking-tight leading-none">
                  Naatukoottam
                </span>
                <span className="text-[10px] font-semibold text-[#16A34A] bg-[#EAF7EF] border border-[#D1EBD9] px-1.5 py-0.2 rounded-md leading-tight">
                  കേരളം
                </span>
              </div>
              <p className="text-[11px] text-[#718078] tracking-normal font-medium leading-tight mt-0.5">
                {t.taglineMalayalam}
              </p>
            </div>
          </button>
        </div>

        {/* Global Search Bar (Social Feed Search) */}
        <div className="hidden md:flex flex-1 max-w-md mx-2">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-[#718078] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder={
                language === 'ml'
                  ? 'പ്രദേശങ്ങൾ, വിഷയങ്ങൾ, ചർച്ചകൾ തിരയുക...'
                  : 'Search topics, wards, local discussions...'
              }
              className="w-full pl-9 pr-8 py-2 bg-[#F8FAF8] hover:bg-white focus:bg-white border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl text-xs text-[#17231D] placeholder-[#718078] transition-all outline-none shadow-2xs focus:ring-2 focus:ring-[#16A34A]/10"
            />
            {headerSearch && (
              <button
                onClick={() => setHeaderSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#17231D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Center/Right Actions: Locality Selector + Language Segment + Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Locality Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setIsLocalityDropdownOpen(!isLocalityDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-full bg-[#EAF7EF] border border-[#D1EBD9] hover:border-[#16A34A]/40 text-[#17231D] text-xs font-semibold transition-all active-press group"
              title="Change Locality"
            >
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#16A34A] animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-[#16A34A] flex-shrink-0" />
              <span className="truncate max-w-[75px] sm:max-w-[140px]">
                {currentLocality}
              </span>
              <ChevronDown className="w-3 h-3 text-[#718078] group-hover:text-[#17231D] transition-transform duration-150 flex-shrink-0" />
            </button>

            {/* Locality Selector Dropdown */}
            {isLocalityDropdownOpen && (
              <div className="absolute right-0 sm:left-1/2 sm:-translate-x-1/2 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#E4EBE6] p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-[#E4EBE6]">
                  <div>
                    <h4 className="text-xs font-bold text-[#17231D]">
                      {language === 'ml' ? 'പ്രദേശം തിരഞ്ഞെടുക്കുക' : 'Select Locality'}
                    </h4>
                    <p className="text-[10px] text-[#718078]">
                      {language === 'ml' ? 'നിങ്ങളുടെ വാർഡിലെ വാർത്തകൾ കാണാം' : 'Showing hyperlocal feed for this area'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsLocalityDropdownOpen(false)}
                    className="p-1 rounded-lg text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* GPS Trigger Button */}
                <button
                  type="button"
                  onClick={handleHeaderGpsDetect}
                  disabled={isDetectingGps}
                  className="w-full py-2 px-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-75 active-press"
                >
                  {isDetectingGps ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{language === 'ml' ? 'GPS കണ്ടെത്തുന്നു...' : 'Acquiring GPS fix...'}</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{t.create.useMyLiveLocation}</span>
                    </>
                  )}
                </button>

                {/* Search Input in Dropdown */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-[#718078] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'ml'
                        ? 'സ്ഥലം, ജില്ല, പിൻകോഡ് തിരയുക...'
                        : 'Search ward, district, pincode...'
                    }
                    className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAF8] border border-[#E4EBE6] focus:border-[#16A34A] rounded-xl text-xs text-[#17231D] placeholder-[#718078] outline-none"
                  />
                </div>

                {/* Locality Items List */}
                <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                  {filteredLocalities.slice(0, 15).map((loc) => {
                    const isSelected = currentLocality === loc.name;
                    return (
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
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#EAF7EF] text-[#16A34A] font-bold border border-[#D1EBD9]'
                            : 'text-[#17231D] hover:bg-[#F8FAF8]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-[#16A34A]' : 'text-[#718078]'}`} />
                          <div>
                            <span className="font-semibold">{loc.name}</span>
                            <span className="text-[10px] text-[#718078] ml-1.5">
                              {loc.district} · {loc.pincode}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#16A34A]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher (Segmented Pill) */}
          <div className="flex items-center bg-[#F8FAF8] p-0.5 rounded-full border border-[#E4EBE6]">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition-all ${
                language === 'en'
                  ? 'bg-white text-[#16A34A] shadow-2xs font-bold'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('ml')}
              className={`px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-semibold rounded-full transition-all ${
                language === 'ml'
                  ? 'bg-white text-[#16A34A] shadow-2xs font-bold'
                  : 'text-[#718078] hover:text-[#17231D]'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Notifications Trigger */}
          <button
            onClick={() => setActiveTab('notifications')}
            className="relative p-1.5 sm:p-2 rounded-xl text-[#17231D] hover:bg-[#F8FAF8] hover:text-[#16A34A] border border-transparent hover:border-[#E4EBE6] transition-all active-press"
            title={t.nav.notifications}
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.9]" />
            <span className="absolute top-1 sm:top-1.5 right-1 sm:right-1.5 w-2 h-2 rounded-full bg-[#DC2626] ring-2 ring-white" />
          </button>

          {/* Authentication Action Pill */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 rounded-full border border-[#D1EBD9] bg-[#EAF7EF] hover:bg-[#d8f2de] transition-all active-press"
              >
                <UserAvatar
                  src={currentUser.avatarUrl}
                  name={currentUser.fullName}
                  size="xs"
                />
                <span className="hidden md:inline text-xs font-bold text-[#16A34A] max-w-[100px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <ChevronDown className="w-3 h-3 text-[#16A34A] opacity-75 hidden sm:inline" />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-[#E4EBE6] p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
                  <div className="px-3 py-2 border-b border-[#E4EBE6]/70">
                    <div className="text-xs font-bold text-[#17231D] truncate">{currentUser.fullName}</div>
                    <div className="text-[10px] text-[#718078]">{currentUser.role === 'DEPARTMENT_OFFICIAL' ? '🏛️ Official' : '🌿 Citizen'} · {currentUser.locality}</div>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#17231D] hover:bg-[#F8FAF8] flex items-center gap-2"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-[#16A34A]" />
                    <span>{t.nav.profile}</span>
                  </button>
                  {currentUser.role === 'DEPARTMENT_OFFICIAL' && (
                    <button
                      onClick={() => {
                        setActiveTab('official');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-[#17231D] hover:bg-[#F8FAF8] flex items-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#16A34A]" />
                      <span>{t.nav.officialPortal}</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.auth.logout}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true, 'login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold shadow-xs transition-all active-press"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.auth.signIn}</span>
            </button>
          )}

          {/* Onboarding Info Trigger */}
          <button
            onClick={() => setIsOnboardingOpen(true)}
            className="hidden sm:flex p-2 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
            title="About Platform & Guidelines"
          >
            <Info className="w-5 h-5 stroke-[1.9]" />
          </button>
        </div>
      </div>
    </header>
  );
};
