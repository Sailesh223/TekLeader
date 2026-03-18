import { Avatar, AvatarProps } from '@mui/material';
import { useState, useEffect } from 'react';
import { getDefaultAvatar, getAvatarById, getStorageKey } from '../utils/avatarGenerator';

interface UserAvatarProps extends Omit<AvatarProps, 'src'> {
  name: string;
  email?: string | null;
  customAvatarUrl?: string | null;
}

/**
 * Load avatar URL from localStorage or generate default
 */
function loadAvatarUrl(
  email: string | null | undefined,
  name: string,
  customAvatarUrl?: string | null
): string {
  // Priority 1: Use custom avatar URL if provided (from PersonalDashboard state)
  if (customAvatarUrl) {
    console.log('🎨 Using custom avatar URL for', name);
    return customAvatarUrl;
  }

  // Priority 2: Check localStorage for saved avatar
  const storageKey = getStorageKey(email, name);
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);

      // Check if it's a custom uploaded image (base64)
      if (parsed.avatarUrl && parsed.avatarUrl.startsWith('data:image')) {
        console.log('📷 Loaded custom uploaded image for', name);
        return parsed.avatarUrl;
      }

      // Check if it's a predefined avatar ID
      if (parsed.avatarId) {
        const avatar = getAvatarById(parsed.avatarId);
        if (avatar) {
          console.log('💾 Loaded predefined avatar for', name, ':', avatar.name);
          return avatar.url;
        }
      }

      // Fallback: if we have a URL directly
      if (parsed.avatarUrl) {
        console.log('💾 Loaded saved avatar URL for', name);
        return parsed.avatarUrl;
      }
    }
  } catch (e) {
    console.error('Failed to parse saved avatar:', e);
  }

  // Priority 3: Generate default avatar from name
  console.log('🎲 Generating default avatar for', name);
  const defaultAvatar = getDefaultAvatar(name);
  return defaultAvatar.url;
}

/**
 * UserAvatar component that generates consistent avatars based on user's email or name
 * Loads saved customizations from localStorage
 * Falls back to initials if no avatar is available
 */
export default function UserAvatar({
  name,
  email,
  customAvatarUrl,
  sx,
  ...props
}: UserAvatarProps) {
  const initials = name.charAt(0).toUpperCase();

  // Use state to allow re-rendering when localStorage changes
  const [avatarUrl, setAvatarUrl] = useState<string>(() =>
    loadAvatarUrl(email, name, customAvatarUrl)
  );

  // Update avatar URL when dependencies change
  useEffect(() => {
    const newUrl = loadAvatarUrl(email, name, customAvatarUrl);
    setAvatarUrl(newUrl);
  }, [name, email, customAvatarUrl]);

  // Listen for avatar changes (custom event for same-tab updates)
  useEffect(() => {
    const handleAvatarChange = (event?: Event) => {
      console.log('🔔 Avatar change event received for', name, event?.type);
      const newUrl = loadAvatarUrl(email, name, customAvatarUrl);
      console.log('🔄 Updating avatar URL to:', newUrl);
      setAvatarUrl(newUrl);
    };

    console.log('👂 Setting up avatar listeners for', name);
    // Listen for custom avatarChanged event (works in same tab)
    window.addEventListener('avatarChanged', handleAvatarChange);
    // Also listen for storage event (works across tabs)
    window.addEventListener('storage', handleAvatarChange);

    return () => {
      console.log('🧹 Cleaning up avatar listeners for', name);
      window.removeEventListener('avatarChanged', handleAvatarChange);
      window.removeEventListener('storage', handleAvatarChange);
    };
  }, [email, name, customAvatarUrl]);

  // Handle image load errors
  const handleImageError = () => {
    console.error('❌ Failed to load avatar image for', name, 'URL:', avatarUrl);
  };

  console.log('🖼️ Rendering UserAvatar for', name, 'with URL:', avatarUrl);

  return (
    <Avatar
      src={avatarUrl}
      alt={name}
      sx={sx}
      imgProps={{
        onError: handleImageError,
        crossOrigin: 'anonymous'
      }}
      {...props}
    >
      {initials}
    </Avatar>
  );
}