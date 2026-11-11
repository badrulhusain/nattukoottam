'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  Sparkles,
  Compass,
} from 'lucide-react';
import { useAppStore } from '../../lib/store';
import {
  getCurrentGpsPosition,
  reverseGeocodeCoordinates,
  EXTENDED_KERALA_LOCALITIES,
  KERALA_DISTRICTS,
  DetectedLocation,
} from '../../lib/geolocation';

export const LocationPromptModal: React.FC = () => {
  const {
    isLocationPromptOpen,
    setIsLocationPromptOpen,
    saveAndSetUserLocation,
    language,
    currentLocality,
  } = useAppStore();

  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Ernakulam');
  const [selectedLocality, setSelectedLocality] = useState(currentLocality || 'Kakkanad');
  const [isManualMode, setIsManualMode] = useState(false);

  if (!isLocationPromptOpen) return null;

  const handleDetectGps = async () => {
    setIsDetecting(true);
    setErrorMsg(null);

    try {
      const position = await getCurrentGpsPosition();
      const { latitude, longitude, accuracy } = position.coords;

      const detected = await reverseGeocodeCoordinates(latitude, longitude, accuracy);
      saveAndSetUserLocation(detected);
    } catch (err: any) {
      console.warn('GPS detection failed:', err);
      let msg =
        language === 'ml'
          ? 'GPS ലൊക്കേഷൻ ലഭ്യമായില്ല. ദയവായി താഴെ നിങ്ങളുടെ സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.'
          : 'Could not access GPS. Please choose your town or ward below.';

      if (err?.code === 1) {
        msg =
          language === 'ml'
            ? 'ലൊക്കേഷൻ അനുമതി നൽകിയിട്ടില്ല. താഴെ നിങ്ങളുടെ സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക.'
            : 'Location permission was denied. Please select your town below.';
      }
      setErrorMsg(msg);
      setIsManualMode(true);
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualSave = () => {
    const found =
      EXTENDED_KERALA_LOCALITIES.find(
        (l) => l.name.toLowerCase() === selectedLocality.toLowerCase()
      ) ||
      EXTENDED_KERALA_LOCALITIES.find((l) => l.district === selectedDistrict) ||
      EXTENDED_KERALA_LOCALITIES[0];

    const loc: DetectedLocation = {
      latitude: found.lat,
      longitude: found.lng,
      accuracy: 50,
      locality: found.name,
      district: found.district,
      state: 'Kerala',
      formattedAddress: `${found.name}, ${found.district}, Kerala (${found.pincode})`,
      pincode: found.pincode,
    };

    saveAndSetUserLocation(loc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden bg-white p-6 shadow-2xl border border-[#E4EBE6] text-center space-y-4">
        {/* Dismiss Button */}
        <button
          onClick={() => setIsLocationPromptOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-[#718078] hover:text-[#17231D] hover:bg-[#F8FAF8] transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing GPS Emblem */}
        <div className="pt-2">
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#16A34A]/20 animate-ping" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#16A34A] to-[#22C55E] flex items-center justify-center text-white shadow-lg shadow-[#16A34A]/30">
              <Navigation className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Heading & Context */}
        <div className="space-y-1.5 px-2">
          <h3 className="text-lg font-extrabold text-[#17231D]">
            {language === 'ml'
              ? 'നിങ്ങളുടെ വാർഡ് / സ്ഥലം സജ്ജീകരിക്കുക'
              : 'Set Your Ward Location'}
          </h3>
          <p className="text-xs text-[#718078] leading-relaxed">
            {language === 'ml'
              ? 'നിങ്ങളുടെ പ്രദേശത്തെ തത്സമയ റോഡ് പണികളും പ്രശ്നങ്ങളും കാണുന്നതിനായി സ്ഥലം സജ്ജീകരിക്കുക. ഇത് നിങ്ങളുടെ അക്കൗണ്ടിൽ സുരക്ഷിതമായി സൂക്ഷിക്കും.'
              : 'Set your ward to view civic reports, project conflicts, and community updates near you. This will be saved to your account.'}
          </p>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Main Action 1: Auto GPS Detect */}
        <div className="space-y-2.5 pt-1">
          <button
            type="button"
            onClick={handleDetectGps}
            disabled={isDetecting}
            className="w-full py-3 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white font-bold text-xs shadow-md shadow-[#16A34A]/25 transition-all flex items-center justify-center gap-2 cursor-pointer active-press"
          >
            {isDetecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {language === 'ml'
                    ? 'GPS വഴി കണ്ടെത്തുന്നു...'
                    : 'Acquiring GPS location...'}
                </span>
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4" />
                <span>
                  {language === 'ml'
                    ? 'ലൈവ് GPS സ്ഥാനം കണ്ടെത്തുക'
                    : 'Use Live GPS Location'}
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-[#718078]">
            <div className="flex-1 h-px bg-[#E4EBE6]" />
            <span>{language === 'ml' ? 'അല്ലെങ്കിൽ' : 'or choose manually'}</span>
            <div className="flex-1 h-px bg-[#E4EBE6]" />
          </div>

          {/* Action 2: Manual Locality Picker */}
          {!isManualMode ? (
            <button
              type="button"
              onClick={() => setIsManualMode(true)}
              className="w-full py-2.5 px-3 rounded-xl border border-[#D1EBD9] bg-[#EAF7EF]/60 hover:bg-[#EAF7EF] text-[#16A34A] font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {language === 'ml'
                  ? 'സ്ഥലം നേരിട്ട് തിരഞ്ഞെടുക്കുക'
                  : 'Select Town / Ward Manually'}
              </span>
            </button>
          ) : (
            <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E4EBE6] text-left space-y-2.5 animate-in fade-in">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-[#718078] block mb-1">
                    {language === 'ml' ? 'ജില്ല' : 'District'}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      const dist = e.target.value;
                      setSelectedDistrict(dist);
                      const first = EXTENDED_KERALA_LOCALITIES.find(
                        (l) => l.district === dist
                      );
                      if (first) setSelectedLocality(first.name);
                    }}
                    className="w-full p-2 bg-white border border-[#E4EBE6] rounded-lg text-xs font-medium text-[#17251D] outline-none"
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-[#718078] block mb-1">
                    {language === 'ml' ? 'പ്രദേശം / ടൗൺ' : 'Town / Ward'}
                  </label>
                  <select
                    value={selectedLocality}
                    onChange={(e) => setSelectedLocality(e.target.value)}
                    className="w-full p-2 bg-white border border-[#E4EBE6] rounded-lg text-xs font-medium text-[#17251D] outline-none"
                  >
                    {EXTENDED_KERALA_LOCALITIES.filter(
                      (l) => l.district === selectedDistrict
                    ).map((l) => (
                      <option key={l.name} value={l.name}>
                        {l.name} ({l.pincode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualSave}
                className="w-full py-2 rounded-lg bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs shadow-xs transition-colors"
              >
                {language === 'ml' ? 'സ്ഥിരീകരിച്ച് സേവ് ചെയ്യുക' : 'Save & Continue'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

