'use client';

import React from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-22 h-22 sm:w-24 sm:h-24 text-2xl font-bold',
  };

  const getInitials = (n: string) => {
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase() || 'U';
  };

  if (src && !imageError) {
    return (
      <img
        src={src}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-2xs ${className}`}
      />
    );
  }

  // Graceful Initials Avatar (No broken images!)
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-[#16A34A] to-[#34D399] text-white font-extrabold flex items-center justify-center ring-2 ring-white shadow-2xs flex-shrink-0 select-none ${className}`}
      title={name}
    >
      {name && name !== 'Guest' ? (
        <span>{getInitials(name)}</span>
      ) : (
        <UserIcon className="w-1/2 h-1/2 text-white" />
      )}
    </div>
  );
};

