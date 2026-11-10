import { InfrastructureIssue, Post, ProjectConflict, User } from '../types';

export const KERALA_LOCALITIES = [
  { name: 'Kakkanad', district: 'Ernakulam', pincode: '682030' },
  { name: 'Aluva', district: 'Ernakulam', pincode: '683101' },
  { name: 'Perinthalmanna', district: 'Malappuram', pincode: '679322' },
  { name: 'Edappal', district: 'Malappuram', pincode: '679576' },
  { name: 'Manjeri', district: 'Malappuram', pincode: '676121' },
  { name: 'Palayam', district: 'Kozhikode', pincode: '673001' },
  { name: 'Kowdiar', district: 'Thiruvananthapuram', pincode: '695003' },
  { name: 'Fort Kochi', district: 'Ernakulam', pincode: '682001' },
];

export const CURRENT_USER_MOCK: User = {
  id: 'user_uditsmith_01',
  fullName: 'Uditsmith Thakuria',
  username: 'allfathr_design',
  role: 'CITIZEN',
  district: 'Ernakulam',
  locality: 'Kakkanad',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: '🌿 Community volunteer & Designer. Passionate about Kerala infrastructure & clean water access.',
  interests: ['Road Safety', 'Clean Water', 'Waste Management', 'Open Data'],
  followersCount: 108,
  followingCount: 42,
  grievancesCount: 18,
  postsCount: 20,
  preferredLang: 'ml',
};

export const INITIAL_POSTS_MOCK: Post[] = [
  {
    id: 'post_01',
    author: {
      id: 'author_anidhya',
      fullName: 'Anidhya Sharma',
      username: 'anidhya_s',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      locality: 'Kakkanad, Kochi',
    },
    content: 'Potholes in front of Fresco Hotel on Infopark Expressway. Vehicles are struggling to pass through and two-wheelers are skidding during rains. Need urgent fixing before the monsoon gets worse!',
    category: 'ROAD_TRANSPORT',
    urgency: 'HIGH',
    locality: 'Kakkanad',
    district: 'Ernakulam',
    mediaUrls: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1596280479133-c35f29d494fe?w=800&auto=format&fit=crop&q=80',
    ],
    likesCount: 245,
    isLiked: false,
    supportsCount: 634,
    isSupported: true,
    commentsCount: 82,
    sharesCount: 21,
    createdAt: '25m ago',
    isInfrastructureIssue: true,
  },
  {
    id: 'post_02',
    author: {
      id: 'author_radhika',
      fullName: 'Radhika Menath',
      username: 'radhika_m',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      locality: 'Perinthalmanna',
    },
    content: 'കുടിവെള്ള വിതരണം കഴിഞ്ഞ 2 ദിവസമായി നിലച്ചിരിക്കുകയാണ്. സമീപത്തെ പൈപ്പ് ലൈൻ പൊട്ടിയതാണ് കാരണമെന്ന് നാട്ടുകാർ പറയുന്നു. Kerala Water Authority ഉദ്യോഗസ്ഥർ ഉടൻ ഇടപെടണമെന്ന് അഭ്യർത്ഥിക്കുന്നു.',
    category: 'WATER_SUPPLY',
    urgency: 'CRITICAL',
    locality: 'Perinthalmanna',
    district: 'Malappuram',
    mediaUrls: [
      'https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&auto=format&fit=crop&q=80',
    ],
    likesCount: 112,
    isLiked: true,
    supportsCount: 489,
    isSupported: false,
    commentsCount: 45,
    sharesCount: 18,
    createdAt: '1h ago',
    isInfrastructureIssue: true,
  },
  {
    id: 'post_03',
    author: {
      id: 'author_vishnu',
      fullName: 'Vishnu Narayanan',
      username: 'vishnu_kseb',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      locality: 'Aluva',
    },
    content: 'Electric post tilted dangerously near the bus stop on Market Road after yesterday\'s winds. High tension line sagging close to pedestrian walk. Please avoid this path until KSEB attends.',
    category: 'ELECTRICITY',
    urgency: 'HIGH',
    locality: 'Aluva',
    district: 'Ernakulam',
    mediaUrls: [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&auto=format&fit=crop&q=80',
    ],
    likesCount: 78,
    isLiked: false,
    supportsCount: 312,
    isSupported: false,
    commentsCount: 29,
    sharesCount: 54,
    createdAt: '3h ago',
    isInfrastructureIssue: true,
  },
];

export const INITIAL_CONFLICTS_MOCK: ProjectConflict[] = [
  {
    id: 'conflict_kakkanad_01',
    title: 'Panchayat Road Resurfacing vs. KWA Water Pipeline Excavation',
    projectA: {
      name: 'Thrikkakara - Kakkanad Link Road Tarring & Resurfacing',
      department: 'PWD / Local Self Government',
      startDate: '2026-11-20',
      endDate: '2026-12-10',
    },
    projectB: {
      name: 'Underground Feeder Pipeline Replacement Project',
      department: 'Kerala Water Authority (KWA)',
      startDate: '2026-11-25',
      endDate: '2026-12-28',
    },
    locality: 'Kakkanad',
    roadName: 'Seaport-Airport Road Junction',
    distanceMeters: 45,
    recommendedAction: 'Postpone road resurfacing by 3 weeks until KWA completes pipe trenching and backfilling to prevent new road destruction.',
    status: 'POTENTIAL',
  },
];

export const ACTIVE_STORIES_MOCK = [
  { id: '1', name: 'You', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', isLive: false },
  { id: '2', name: 'Kakkanad', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', isLive: true },
  { id: '3', name: 'Aluva KWA', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80', isLive: false },
  { id: '4', name: 'Perinthalmanna', avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80', isLive: true },
  { id: '5', name: 'Kozhikode', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80', isLive: false },
];

