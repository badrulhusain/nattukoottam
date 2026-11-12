'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatLayer } from 'leaflet.heat';
import { Navigation, Plus, Minus, Compass, MapPin, Flame, Layers } from 'lucide-react';
import { DetectedLocation } from '../../lib/geolocation';

export type MapViewMode = 'markers' | 'heat' | 'hybrid';

export interface MapPinItem {
  id: string;
  title: string;
  locality: string;
  district?: string;
  lat: number;
  lng: number;
  urgency?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  mediaUrl?: string;
  isUserLoc?: boolean;
  supports?: number;
  comments?: number;
  reporterName?: string;
  createdAt?: string;
}

export function calculatePulseScore(pin: MapPinItem): number {
  const supports = pin.supports || 0;
  const comments = pin.comments || 0;
  let urgencyWeight = 0.3;
  if (pin.urgency === 'CRITICAL') urgencyWeight = 1.0;
  else if (pin.urgency === 'HIGH') urgencyWeight = 0.75;
  else if (pin.urgency === 'MEDIUM') urgencyWeight = 0.5;

  const raw = supports * 2 + comments * 1.5 + urgencyWeight * 10;
  // Normalized between 0.25 and 1.0
  return Math.min(1.0, Math.max(0.25, raw / 20));
}

interface LeafletInteractiveMapProps {
  pins: MapPinItem[];
  selectedPinId: string | null;
  onSelectPin: (id: string) => void;
  userLocation: DetectedLocation | null;
  language: 'ml' | 'en';
}

function getCategoryColor(category?: string): string {
  switch (category) {
    case 'ROAD_TRANSPORT':
    case 'ROADS':
      return '#EA580C'; // amber-orange
    case 'WATER_SANITATION':
    case 'WATER':
      return '#0284C7'; // sky-blue
    case 'ELECTRICITY':
      return '#EAB308'; // yellow
    case 'WASTE_MANAGEMENT':
      return '#16A34A'; // green
    case 'PUBLIC_HEALTH':
      return '#E11D48'; // rose
    default:
      return '#16A34A'; // default green
  }
}

function getCategoryIconSvg(category?: string): string {
  switch (category) {
    case 'ROAD_TRANSPORT':
    case 'ROADS':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19L8 5h8l4 14"/><path d="M12 5v4"/><path d="M12 13v2"/><path d="M12 19v2"/></svg>';
    case 'WATER_SANITATION':
    case 'WATER':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>';
    case 'ELECTRICITY':
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';
    default:
      return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
  }
}

export const LeafletInteractiveMap: React.FC<LeafletInteractiveMapProps> = ({
  pins,
  selectedPinId,
  onSelectPin,
  userLocation,
  language,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<any>(null);
  const initialFitRef = useRef(false);

  const [viewMode, setViewMode] = useState<MapViewMode>('hybrid');

  // Initialize Map
  useEffect(() => {
    if (!containerRef.current) return;
    if (mapRef.current) return;

    // Default center: Kerala (Kakkanad / Ernakulam)
    const initialLat = userLocation?.latitude || 10.0159;
    const initialLng = userLocation?.longitude || 76.3419;

    const map = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([initialLat, initialLng], 12);

    // OpenStreetMap standard tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // Subtle attribution in bottom right corner
    L.control
      .attribution({
        position: 'bottomleft',
        prefix: '&copy; OpenStreetMap',
      })
      .addTo(map);

    mapRef.current = map;
    markersLayerRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      markersLayerRef.current = null;
      heatLayerRef.current = null;
      initialFitRef.current = false;
    };
  }, []);

  // Sync Pulse Heatmap Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
      heatLayerRef.current = null;
    }

    if (viewMode === 'heat' || viewMode === 'hybrid') {
      const heatPoints = pins
        .filter(
          (p) =>
            !p.isUserLoc &&
            typeof p.lat === 'number' &&
            typeof p.lng === 'number' &&
            !isNaN(p.lat) &&
            !isNaN(p.lng)
        )
        .map((p) => [p.lat, p.lng, calculatePulseScore(p)] as [number, number, number]);

      if (heatPoints.length > 0) {
        try {
          const heatLayer = new HeatLayer(heatPoints, {
            radius: viewMode === 'heat' ? 36 : 26,
            blur: 20,
            max: 1.0,
            minOpacity: 0.35,
            gradient: {
              0.2: '#0284c7', // Sky Blue
              0.45: '#16a34a', // Emerald Green
              0.7: '#f59e0b', // Amber Alert
              0.95: '#dc2626', // Hotspot Red
            },
          });
          map.addLayer(heatLayer as any);
          heatLayerRef.current = heatLayer;
        } catch (err) {
          console.warn('HeatLayer failed to initialize:', err);
        }
      }
    }
  }, [pins, viewMode]);

  // Sync Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    const bounds: [number, number][] = [];

    pins.forEach((pin) => {
      if (typeof pin.lat !== 'number' || typeof pin.lng !== 'number') return;
      if (isNaN(pin.lat) || isNaN(pin.lng)) return;

      bounds.push([pin.lat, pin.lng]);
      const isSelected = pin.id === selectedPinId;

      let iconHtml = '';
      let iconSize: [number, number] = [40, 48];
      let iconAnchor: [number, number] = [20, 46];

      if (pin.isUserLoc) {
        // Glowing Blue GPS Location Pin
        iconSize = [36, 36];
        iconAnchor = [18, 18];
        iconHtml = `
          <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 9999px; background-color: #3B82F6; opacity: 0.35; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: relative; width: 22px; height: 22px; border-radius: 9999px; background: #2563EB; border: 3px solid #FFFFFF; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px;">
              📍
            </div>
          </div>
        `;
      } else if (viewMode === 'heat') {
        // Subtle micro-pulse dot in Heatmap-only mode
        const pulse = calculatePulseScore(pin);
        const dotColor =
          pulse > 0.75 ? '#DC2626' : pulse > 0.5 ? '#EA580C' : pulse > 0.35 ? '#16A34A' : '#0284C7';
        iconSize = [18, 18];
        iconAnchor = [9, 9];
        iconHtml = `
          <div style="width: 18px; height: 18px; border-radius: 9999px; background-color: ${dotColor}; border: 2.5px solid #FFFFFF; box-shadow: 0 0 8px ${dotColor}; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="width: 6px; height: 6px; border-radius: 9999px; background-color: #FFFFFF;"></div>
          </div>
        `;
      } else {
        // Civic Issue Pin
        const categoryColor = getCategoryColor(pin.category);
        const iconSvg = getCategoryIconSvg(pin.category);
        const ringStyle = isSelected
          ? 'box-shadow: 0 0 0 4px #16A34A40, 0 8px 12px rgba(0,0,0,0.35); transform: scale(1.15);'
          : 'box-shadow: 0 4px 8px rgba(0,0,0,0.25);';

        iconHtml = `
          <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer; transition: transform 0.2s ease;">
            <div style="background-color: #17231D; color: #FFFFFF; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 2px; max-width: 90px; overflow: hidden; text-overflow: ellipsis;">
              ${pin.locality}
            </div>
            <div style="width: 32px; height: 32px; border-radius: 9999px; background-color: ${categoryColor}; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; color: #FFFFFF; ${ringStyle}">
              ${iconSvg}
            </div>
            <div style="width: 4px; height: 4px; border-radius: 9999px; background-color: rgba(0,0,0,0.4); margin-top: 1px;"></div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: iconHtml,
        iconSize,
        iconAnchor,
        popupAnchor: [0, -38],
      });

      const marker = L.marker([pin.lat, pin.lng], { icon: customIcon });

      // Popup Content
      if (!pin.isUserLoc) {
        const pulse = calculatePulseScore(pin);
        const popupHtml = `
          <div style="font-family: inherit; font-size: 12px; min-width: 170px; max-width: 230px; padding: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 10px; font-weight: 800; color: #16A34A; text-transform: uppercase;">
                ${pin.category ? pin.category.replace(/_/g, ' ') : 'GRIEVANCE'}
              </span>
              <span style="font-size: 9px; font-weight: 700; background-color: ${pin.urgency === 'CRITICAL' ? '#FEF2F2' : '#FFF7ED'}; color: ${pin.urgency === 'CRITICAL' ? '#DC2626' : '#EA580C'}; padding: 1px 5px; border-radius: 4px;">
                ${pin.urgency || 'ACTIVE'}
              </span>
            </div>
            <div style="font-weight: 700; color: #17231D; font-size: 12px; line-height: 1.3; margin-bottom: 4px;">
              ${pin.title}
            </div>
            <div style="font-size: 10px; color: #718078; display: flex; align-items: center; justify-content: space-between; gap: 4px; border-top: 1px solid #E4EBE6; pt: 4px; margin-top: 4px;">
              <span>📍 ${pin.locality}</span>
              <span style="color: #EA580C; font-weight: 700;">🔥 ${Math.round(pulse * 100)}% Pulse</span>
            </div>
          </div>
        `;
        marker.bindPopup(popupHtml, {
          closeButton: false,
          offset: [0, -10],
        });
      } else {
        marker.bindPopup(
          `<div style="font-size: 11px; font-weight: 700; padding: 2px;">📍 ${language === 'ml' ? 'നിങ്ങളുടെ ലൊക്കേഷൻ' : 'Your Location'} (${pin.locality})</div>`,
          { closeButton: false }
        );
      }

      marker.on('click', () => {
        onSelectPin(pin.id);
        marker.openPopup();
      });

      if (isSelected && !pin.isUserLoc) {
        marker.openPopup();
      }

      markersLayerRef.current?.addLayer(marker);
    });

    // Auto-fit bounds on initial load if we have pins
    if (bounds.length > 0 && !initialFitRef.current) {
      initialFitRef.current = true;
      if (bounds.length === 1) {
        map.setView(bounds[0], 14);
      } else {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [pins, selectedPinId, language, onSelectPin, viewMode]);

  // Handler to fly to User Location
  const handleFlyToMe = () => {
    if (!mapRef.current) return;
    if (userLocation) {
      mapRef.current.flyTo([userLocation.latitude, userLocation.longitude], 15, {
        duration: 1.2,
      });
    } else if (pins.length > 0) {
      mapRef.current.flyTo([pins[0].lat, pins[0].lng], 14, { duration: 1.2 });
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] rounded-2xl overflow-hidden border border-[#E4EBE6] shadow-sm bg-[#EAF7EF]/20">
      {/* Map Leaflet Canvas Container */}
      <div ref={containerRef} className="w-full h-full z-0" />

      {/* Floating Header Banner */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E4EBE6] shadow-sm pointer-events-auto">
        <Compass className="w-4 h-4 text-[#16A34A]" />
        <span className="text-xs font-bold text-[#17231D]">
          {language === 'ml' ? 'കേരള വാർഡ് റഡാർ' : 'Kerala Ward Radar'}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-bold text-[#16A34A] bg-[#EAF7EF] px-2 py-0.5 rounded-md ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-ping" />
          {pins.filter((p) => !p.isUserLoc).length} {language === 'ml' ? 'ഇഷ്യൂകൾ' : 'Issues'}
        </span>
      </div>

      {/* View Mode Switcher: Hybrid | Heatmap | Pins */}
      <div className="absolute top-12 left-3 z-[400] flex items-center bg-white/95 backdrop-blur-md p-1 rounded-xl border border-[#E4EBE6] shadow-sm gap-1 pointer-events-auto">
        <button
          type="button"
          onClick={() => setViewMode('hybrid')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
            viewMode === 'hybrid'
              ? 'bg-[#16A34A] text-white shadow-sm'
              : 'text-[#526359] hover:bg-[#F2F7F4]'
          }`}
          title="Show both heatmap pulse and markers"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === 'ml' ? 'ഹൈബ്രിഡ്' : 'Hybrid'}</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('heat')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
            viewMode === 'heat'
              ? 'bg-[#EA580C] text-white shadow-sm'
              : 'text-[#526359] hover:bg-[#F2F7F4]'
          }`}
          title="Show community heat density"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{language === 'ml' ? 'പൾസ് മാപ്പ്' : 'Pulse Heat'}</span>
        </button>
        <button
          type="button"
          onClick={() => setViewMode('markers')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
            viewMode === 'markers'
              ? 'bg-[#17231D] text-white shadow-sm'
              : 'text-[#526359] hover:bg-[#F2F7F4]'
          }`}
          title="Show standard pin markers"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>{language === 'ml' ? 'മാർക്കറുകൾ' : 'Pins'}</span>
        </button>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col rounded-xl overflow-hidden shadow-md border border-[#E4EBE6] bg-white pointer-events-auto">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          className="p-2 hover:bg-[#F8FAF8] text-[#17231D] active-press transition-colors cursor-pointer"
          title="Zoom in"
        >
          <Plus className="w-4 h-4" />
        </button>
        <div className="h-[1px] bg-[#E4EBE6]" />
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          className="p-2 hover:bg-[#F8FAF8] text-[#17231D] active-press transition-colors cursor-pointer"
          title="Zoom out"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* Heatmap Legend */}
      {(viewMode === 'heat' || viewMode === 'hybrid') && (
        <div className="absolute bottom-3 left-3 z-[400] flex flex-col gap-1 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#E4EBE6] shadow-sm pointer-events-auto text-[10px]">
          <div className="flex items-center justify-between gap-3 text-[#17231D] font-bold">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-[#EA580C]" />
              {language === 'ml' ? 'കമ്മ്യൂണിറ്റി പൾസ്' : 'Community Pulse'}
            </span>
            <span className="text-[9px] text-[#718078]">
              {language === 'ml' ? 'പിന്തുണ + അടിയന്തിരത' : 'Supports + Urgency'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[9px] text-[#718078]">{language === 'ml' ? 'കുറഞ്ഞത്' : 'Low'}</span>
            <div className="w-20 sm:w-28 h-2 rounded-full bg-gradient-to-r from-[#0284c7] via-[#16a34a] via-[#f59e0b] to-[#dc2626]" />
            <span className="text-[9px] font-bold text-[#dc2626]">{language === 'ml' ? 'തീവ്രം' : 'Hotspot'}</span>
          </div>
        </div>
      )}

      {/* Floating Locate Me / Recenter Button */}
      <div className="absolute bottom-3 right-3 z-[400] pointer-events-auto">
        <button
          type="button"
          onClick={handleFlyToMe}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#EAF7EF] text-[#16A34A] font-bold text-xs shadow-md border border-[#E4EBE6] transition-transform active:scale-95 cursor-pointer"
          title={language === 'ml' ? 'എന്റെ വാർഡിലേക്ക് നീങ്ങുക' : 'Fly to my ward'}
        >
          <Navigation className="w-3.5 h-3.5 fill-current" />
          <span>{language === 'ml' ? 'എന്റെ ലൊക്കേഷൻ' : 'My Location'}</span>
        </button>
      </div>
    </div>
  );
};

export default LeafletInteractiveMap;

