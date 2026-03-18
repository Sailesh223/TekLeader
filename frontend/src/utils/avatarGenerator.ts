// Predefined avatar selection
export interface AvatarSelection {
  id: string;
  type: 'male' | 'female' | 'custom';
  url: string;
  name: string;
}

// 5 Male Avatars - Using simpler DiceBear API
export const maleAvatars: AvatarSelection[] = [
  {
    id: 'male-1',
    type: 'male',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    name: 'Professional'
  },
  {
    id: 'male-2',
    type: 'male',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    name: 'Executive'
  },
  {
    id: 'male-3',
    type: 'male',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=George',
    name: 'Creative'
  },
  {
    id: 'male-4',
    type: 'male',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack',
    name: 'Casual'
  },
  {
    id: 'male-5',
    type: 'male',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    name: 'Trendy'
  }
];

// 5 Female Avatars - Using simpler DiceBear API
export const femaleAvatars: AvatarSelection[] = [
  {
    id: 'female-1',
    type: 'female',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    name: 'Professional'
  },
  {
    id: 'female-2',
    type: 'female',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    name: 'Executive'
  },
  {
    id: 'female-3',
    type: 'female',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Isabella',
    name: 'Creative'
  },
  {
    id: 'female-4',
    type: 'female',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mia',
    name: 'Casual'
  },
  {
    id: 'female-5',
    type: 'female',
    url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlotte',
    name: 'Trendy'
  }
];

// All avatars combined
export const allPredefinedAvatars = [...maleAvatars, ...femaleAvatars];
export const PREDEFINED_AVATARS = allPredefinedAvatars; // Alias for compatibility

// Get avatar by ID
export function getAvatarById(id: string): AvatarSelection | undefined {
  return allPredefinedAvatars.find(avatar => avatar.id === id);
}

// Get default avatar based on name (simple heuristic)
export function getDefaultAvatar(name: string): AvatarSelection {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % allPredefinedAvatars.length;
  return allPredefinedAvatars[index];
}

// Get storage key for avatar preferences
export function getStorageKey(email: string | null | undefined, name: string): string {
  return `avatar_${email || name}`;
}

