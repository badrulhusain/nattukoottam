export interface DetectedLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  locality: string;
  district: string;
  state: string;
  formattedAddress: string;
  road?: string;
  pincode?: string;
}

export interface KeralaLocalityCoord {
  name: string;
  district: string;
  pincode: string;
  lat: number;
  lng: number;
}

// Comprehensive database of major Kerala localities with representative coordinates
export const EXTENDED_KERALA_LOCALITIES: KeralaLocalityCoord[] = [
  // Ernakulam
  { name: 'Kakkanad', district: 'Ernakulam', pincode: '682030', lat: 10.0159, lng: 76.3419 },
  { name: 'Edappally', district: 'Ernakulam', pincode: '682024', lat: 10.0261, lng: 76.3082 },
  { name: 'Kaloor', district: 'Ernakulam', pincode: '682017', lat: 9.9984, lng: 76.2999 },
  { name: 'Fort Kochi', district: 'Ernakulam', pincode: '682001', lat: 9.9658, lng: 76.2421 },
  { name: 'Aluva', district: 'Ernakulam', pincode: '683101', lat: 10.1076, lng: 76.3516 },
  { name: 'Vytilla', district: 'Ernakulam', pincode: '682019', lat: 9.9698, lng: 76.3182 },
  { name: 'Tripunithura', district: 'Ernakulam', pincode: '682301', lat: 9.9489, lng: 76.3516 },
  { name: 'Angamaly', district: 'Ernakulam', pincode: '683572', lat: 10.1960, lng: 76.3860 },
  { name: 'Perumbavoor', district: 'Ernakulam', pincode: '683542', lat: 10.1118, lng: 76.4789 },

  // Thiruvananthapuram
  { name: 'Kowdiar', district: 'Thiruvananthapuram', pincode: '695003', lat: 8.5241, lng: 76.9589 },
  { name: 'Pattom', district: 'Thiruvananthapuram', pincode: '695004', lat: 8.5283, lng: 76.9427 },
  { name: 'Kazhakkoottam', district: 'Thiruvananthapuram', pincode: '695582', lat: 8.5686, lng: 76.8731 },
  { name: 'East Fort', district: 'Thiruvananthapuram', pincode: '695023', lat: 8.4829, lng: 76.9472 },
  { name: 'Neyyattinkara', district: 'Thiruvananthapuram', pincode: '695121', lat: 8.4009, lng: 77.0869 },
  { name: 'Varkala', district: 'Thiruvananthapuram', pincode: '695141', lat: 8.7379, lng: 76.7163 },

  // Malappuram
  { name: 'Perinthalmanna', district: 'Malappuram', pincode: '679322', lat: 10.9760, lng: 76.2254 },
  { name: 'Manjeri', district: 'Malappuram', pincode: '676121', lat: 11.1203, lng: 76.1206 },
  { name: 'Malappuram Town', district: 'Malappuram', pincode: '676505', lat: 11.0510, lng: 76.0711 },
  { name: 'Edappal', district: 'Malappuram', pincode: '679576', lat: 10.7712, lng: 75.9928 },
  { name: 'Tirur', district: 'Malappuram', pincode: '676101', lat: 10.9146, lng: 75.9228 },
  { name: 'Kottakkal', district: 'Malappuram', pincode: '676503', lat: 10.9987, lng: 76.0028 },

  // Kozhikode
  { name: 'Palayam', district: 'Kozhikode', pincode: '673001', lat: 11.2505, lng: 75.7828 },
  { name: 'Mavoor Road', district: 'Kozhikode', pincode: '673004', lat: 11.2612, lng: 75.7954 },
  { name: 'Vadakara', district: 'Kozhikode', pincode: '673101', lat: 11.6033, lng: 75.5906 },
  { name: 'Koyilandy', district: 'Kozhikode', pincode: '673305', lat: 11.4392, lng: 75.6967 },

  // Thrissur
  { name: 'Thrissur Round', district: 'Thrissur', pincode: '680001', lat: 10.5276, lng: 76.2144 },
  { name: 'Guruvayur', district: 'Thrissur', pincode: '680101', lat: 10.5946, lng: 76.0416 },
  { name: 'Chalakudy', district: 'Thrissur', pincode: '680307', lat: 10.3070, lng: 76.3335 },
  { name: 'Irinjalakuda', district: 'Thrissur', pincode: '680121', lat: 10.3444, lng: 76.2081 },

  // Palakkad
  { name: 'Palakkad Town', district: 'Palakkad', pincode: '678001', lat: 10.7867, lng: 76.6548 },
  { name: 'Ottapalam', district: 'Palakkad', pincode: '679101', lat: 10.7725, lng: 76.3768 },
  { name: 'Chittur', district: 'Palakkad', pincode: '678101', lat: 10.6975, lng: 76.7196 },

  // Kollam
  { name: 'Chinnakada', district: 'Kollam', pincode: '691001', lat: 8.8872, lng: 76.5947 },
  { name: 'Kottarakkara', district: 'Kollam', pincode: '691506', lat: 9.0003, lng: 76.7720 },
  { name: 'Karunagappally', district: 'Kollam', pincode: '690518', lat: 9.0560, lng: 76.5385 },

  // Alappuzha
  { name: 'Alappuzha Town', district: 'Alappuzha', pincode: '688001', lat: 9.4981, lng: 76.3388 },
  { name: 'Cherthala', district: 'Alappuzha', pincode: '688524', lat: 9.6847, lng: 76.3361 },
  { name: 'Kayamkulam', district: 'Alappuzha', pincode: '690502', lat: 9.1764, lng: 76.5028 },

  // Kottayam
  { name: 'Kottayam Town', district: 'Kottayam', pincode: '686001', lat: 9.5916, lng: 76.5222 },
  { name: 'Pala', district: 'Kottayam', pincode: '686575', lat: 9.7126, lng: 76.6835 },
  { name: 'Changanassery', district: 'Kottayam', pincode: '686101', lat: 9.4448, lng: 76.5414 },

  // Kannur
  { name: 'Kannur City', district: 'Kannur', pincode: '670001', lat: 11.8745, lng: 75.3704 },
  { name: 'Thalassery', district: 'Kannur', pincode: '670101', lat: 11.7491, lng: 75.4890 },
  { name: 'Payyanur', district: 'Kannur', pincode: '670307', lat: 12.1009, lng: 75.2017 },

  // Kasaragod
  { name: 'Kasaragod Town', district: 'Kasaragod', pincode: '671121', lat: 12.5102, lng: 74.9852 },
  { name: 'Kanhangad', district: 'Kasaragod', pincode: '671315', lat: 12.3082, lng: 75.0911 },

  // Wayanad
  { name: 'Kalpetta', district: 'Wayanad', pincode: '673121', lat: 11.6103, lng: 76.0827 },
  { name: 'Sulthan Bathery', district: 'Wayanad', pincode: '673592', lat: 11.6627, lng: 76.2573 },

  // Idukki
  { name: 'Thodupuzha', district: 'Idukki', pincode: '685584', lat: 9.8959, lng: 76.7184 },
  { name: 'Munnar', district: 'Idukki', pincode: '685612', lat: 10.0889, lng: 77.0595 },

  // Pathanamthitta
  { name: 'Pathanamthitta Town', district: 'Pathanamthitta', pincode: '689645', lat: 9.2648, lng: 76.7870 },
  { name: 'Thiruvalla', district: 'Pathanamthitta', pincode: '689101', lat: 9.3835, lng: 76.5741 },
];

export const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

/**
 * Calculates Haversine distance between two coordinates in kilometers
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest Kerala locality from a given coordinate
 */
export function findClosestKeralaLocality(lat: number, lng: number): KeralaLocalityCoord {
  let closest = EXTENDED_KERALA_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of EXTENDED_KERALA_LOCALITIES) {
    const dist = calculateDistanceKm(lat, lng, loc.lat, loc.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }

  return closest;
}

/**
 * Reverse geocodes coordinates via OpenStreetMap Nominatim with safe fallbacks
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  accuracy: number = 20
): Promise<DetectedLocation> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Naatukoottam-Civic-App/1.0',
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const addr = data.address || {};

      // Determine the best locality name
      const locality =
        addr.suburb ||
        addr.neighbourhood ||
        addr.village ||
        addr.town ||
        addr.city_district ||
        addr.residential ||
        addr.city ||
        addr.county ||
        findClosestKeralaLocality(lat, lng).name;

      // Determine district
      const district =
        addr.state_district ||
        addr.county ||
        addr.city ||
        addr.district ||
        findClosestKeralaLocality(lat, lng).district;

      const state = addr.state || 'Kerala';
      const pincode = addr.postcode;
      const road = addr.road || addr.pedestrian || addr.street;

      const formattedAddress = [road, locality, district, state]
        .filter(Boolean)
        .join(', ');

      return {
        latitude: Number(lat.toFixed(6)),
        longitude: Number(lng.toFixed(6)),
        accuracy: Math.round(accuracy),
        locality,
        district,
        state,
        formattedAddress: formattedAddress || `${locality}, ${district}`,
        road,
        pincode,
      };
    }
  } catch (error) {
    console.warn('Nominatim reverse geocode failed or timed out, using locality lookup:', error);
  }

  // Fallback: Use coordinate proximity match against Kerala database
  const closest = findClosestKeralaLocality(lat, lng);
  return {
    latitude: Number(lat.toFixed(6)),
    longitude: Number(lng.toFixed(6)),
    accuracy: Math.round(accuracy),
    locality: closest.name,
    district: closest.district,
    state: 'Kerala',
    formattedAddress: `${closest.name}, ${closest.district}, Kerala (${closest.pincode})`,
    pincode: closest.pincode,
  };
}

/**
 * Obtains real GPS location using the browser Geolocation API
 */
export function getCurrentGpsPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export const LOCATION_STORAGE_KEY = 'nattukuttam_user_location';

export function getSavedLocation(): DetectedLocation | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocationToStorage(loc: DetectedLocation) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch (err) {
    console.warn('Failed to save location to localStorage:', err);
  }
}

export function clearSavedLocation() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(LOCATION_STORAGE_KEY);
  } catch {}
}

