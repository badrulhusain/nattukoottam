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

export const GUEST_USER: User = {
  id: '',
  fullName: 'Guest Member',
  username: 'guest',
  role: 'CITIZEN',
  district: 'Ernakulam',
  locality: 'Kakkanad',
  avatarUrl: '',
  bio: '',
  interests: [],
  followersCount: 0,
  followingCount: 0,
  grievancesCount: 0,
  postsCount: 0,
  preferredLang: 'ml',
};



export const INITIAL_POSTS_MOCK: Post[] = [];

export const INITIAL_CONFLICTS_MOCK: ProjectConflict[] = [];

export const ACTIVE_STORIES_MOCK: { id: string; name: string; avatar?: string; isLive?: boolean }[] = [];

