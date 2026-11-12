'use client';

import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useAppStore } from '../../lib/store';
import { syncClerkUserApi } from '../../lib/api';
import { User } from '../../types';

export const ClerkSyncHandler: React.FC = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { currentUser, login, currentLocality } = useAppStore();
  const lastSyncedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      if (lastSyncedIdRef.current === user.id && currentUser.id === user.id) {
        return;
      }

      lastSyncedIdRef.current = user.id;

      const primaryEmail = user.primaryEmailAddress?.emailAddress;
      const primaryPhone = user.primaryPhoneNumber?.phoneNumber;
      const fullName =
        user.fullName ||
        user.firstName ||
        primaryEmail?.split('@')[0] ||
        'Community Citizen';
      const avatarUrl = user.imageUrl || '';

      // Sync user to database & obtain JWT session
      syncClerkUserApi({
        clerkId: user.id,
        email: primaryEmail,
        phone: primaryPhone,
        fullName,
        avatarUrl,
        district: currentUser.district || 'Ernakulam',
        locality: currentUser.locality || currentLocality || 'Kakkanad',
      })
        .then((res) => {
          const dbUser = res.user;
          const mappedUser: User = {
            id: dbUser.id || user.id,
            fullName: dbUser.fullName || fullName,
            username: dbUser.email?.split('@')[0] || user.username || user.id.slice(-6),
            email: dbUser.email || primaryEmail,
            phone: dbUser.phone || primaryPhone || '',
            role: dbUser.role || 'CITIZEN',
            district: dbUser.district || 'Ernakulam',
            locality: dbUser.locality || 'Kakkanad',
            avatarUrl: dbUser.avatarUrl || avatarUrl,
            bio: dbUser.bio || '',
            interests: [],
            followersCount: 0,
            followingCount: 0,
            grievancesCount: 0,
            postsCount: 0,
            preferredLang: (dbUser.preferredLang as any) || 'ml',
          };
          login(mappedUser);
        })
        .catch((err) => {
          console.warn('Failed to sync Clerk user with backend:', err);
          login({
            id: user.id,
            fullName,
            username: primaryEmail?.split('@')[0] || user.id.slice(-6),
            email: primaryEmail,
            phone: primaryPhone || '',
            role: 'CITIZEN',
            district: currentUser.district || 'Ernakulam',
            locality: currentUser.locality || currentLocality || 'Kakkanad',
            avatarUrl,
            interests: [],
            followersCount: 0,
            followingCount: 0,
            grievancesCount: 0,
            postsCount: 0,
            preferredLang: 'ml',
          });
        });
    }
  }, [isLoaded, isSignedIn, user, currentUser.id, currentUser.district, currentUser.locality, login, currentLocality]);

  return null;
};

