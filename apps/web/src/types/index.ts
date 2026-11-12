export type Language = 'en' | 'ml';

export type Role = 'CITIZEN' | 'COMMUNITY_MODERATOR' | 'DEPARTMENT_OFFICIAL' | 'ADMIN';

export type IssueCategory =
  | 'ROAD_TRANSPORT'
  | 'WATER_SUPPLY'
  | 'ELECTRICITY'
  | 'DRAINAGE'
  | 'WASTE_MANAGEMENT'
  | 'PUBLIC_SAFETY'
  | 'HEALTH_SANITATION'
  | 'OTHER';

export type IssueStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_FOR_COORDINATION'
  | 'RESOLVED'
  | 'REOPENED'
  | 'REJECTED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  phone?: string;
  role: Role;
  district: string;
  locality: string;
  avatarUrl?: string;
  bio?: string;
  interests?: string[];
  followersCount: number;
  followingCount: number;
  grievancesCount: number;
  postsCount: number;
  preferredLang: Language;
  karmaPoints?: number;
  badges?: string[];
}

export interface Post {
  id: string;
  author: {
    id: string;
    fullName: string;
    username: string;
    avatarUrl?: string;
    locality: string;
    role?: Role;
    karmaPoints?: number;
    badges?: string[];
  };
  content: string;
  category?: IssueCategory;
  urgency?: UrgencyLevel;
  locality: string;
  district: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  mediaUrls: string[];
  likesCount: number;
  isLiked?: boolean;
  supportsCount: number;
  isSupported?: boolean;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
  isInfrastructureIssue?: boolean;
  status?: IssueStatus;
  voiceAudioUrl?: string;
  hasVoiceInPhoto?: boolean;
  department?: {
    id?: string;
    name?: string;
    code?: string;
  };
  resolutionNotes?: string;
  assignedDeptId?: string;
  isAnonymous?: boolean;
  history?: Array<{
    id: string;
    actor?: { fullName: string; role: string };
    toStatus: string;
    notes?: string;
    createdAt: string;
  }>;
}

export interface InfrastructureIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  urgency: UrgencyLevel;
  status: IssueStatus;
  locality: string;
  district: string;
  address?: string;
  latitude: number;
  longitude: number;
  reporter: {
    id: string;
    fullName: string;
    avatarUrl?: string;
  };
  assignedDepartment?: {
    name: string;
    code: string;
  };
  assignedOfficial?: {
    designation: string;
    name: string;
  };
  supportsCount: number;
  isSupported?: boolean;
  mediaUrls: string[];
  history: {
    status: IssueStatus;
    notes?: string;
    timestamp: string;
    actor: string;
  }[];
  createdAt: string;
  aiSuggestedCategory?: IssueCategory;
  aiDuplicateWarning?: string;
}

export interface ProjectConflict {
  id: string;
  title: string;
  projectA: {
    name: string;
    department: string;
    startDate: string;
    endDate: string;
  };
  projectB: {
    name: string;
    department: string;
    startDate: string;
    endDate: string;
  };
  locality: string;
  roadName: string;
  distanceMeters: number;
  recommendedAction: string;
  status: 'POTENTIAL' | 'CONFIRMED' | 'RESOLVED';
}

export interface NotificationItem {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'SUPPORT' | 'STATUS_CHANGE' | 'CONFLICT' | 'OFFICIAL_UPDATE';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  avatarUrl?: string;
  targetId?: string;
}

export interface StoryItem {
  id: string;
  mediaUrl: string;
  caption?: string;
  createdAt: string;
  locality?: string;
  likesCount?: number;
}

export interface UserStory {
  userId: string;
  userName: string;
  userAvatar?: string;
  locality: string;
  hasUnseen: boolean;
  stories: StoryItem[];
}

export type DiscussionRoomType = 'CHANNEL' | 'GROUP' | 'DIRECT';

export interface DiscussionRoom {
  id: string;
  name: string;
  description?: string;
  type: DiscussionRoomType;
  locality?: string;
  district?: string;
  category?: string;
  avatarUrl?: string;
  membersCount: number;
  messagesCount: number;
  isMember: boolean;
  canJoinDirectly: boolean;
  requiresInvite?: boolean;
  latestMessage?: {
    id: string;
    content: string;
    createdAt: string;
    sender?: { fullName: string; avatarUrl?: string };
  };
  createdBy?: { id: string; fullName: string; avatarUrl?: string };
  createdAt: string;
  updatedAt: string;
}

export interface DiscussionMember {
  id: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    locality?: string;
    role?: string;
  };
}

export interface DiscussionMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    avatarUrl?: string;
    locality?: string;
    role?: string;
  };
}



