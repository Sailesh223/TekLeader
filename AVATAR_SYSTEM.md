# 🎨 Avatar System - Complete Guide

## Overview
The TekLeader avatar system provides users with **10 predefined professional avatars** (5 male, 5 female) plus the ability to **upload custom images**. All avatars persist across browser sessions and appear consistently across all dashboards.

---

## ✅ Features

### 1. **Simple Selection**
- **10 Predefined Avatars**: 5 male and 5 female professional avatars
- **Custom Upload**: Upload your own profile picture (max 2MB, JPG/PNG)
- **Easy to Use**: Click, select, save - no complex customization needed

### 2. **Persistent Storage**
- Avatars are saved to `localStorage` with a unique key per user
- Selections persist across browser sessions
- Changes reflect immediately across all dashboards

### 3. **Multi-Dashboard Support**
Avatars appear consistently in:
- ✅ **PersonalDashboard** - Your profile with edit button
- ✅ **UserDashboard** - Leaderboard entries
- ✅ **DirectorDashboard** - Team hierarchy
- ✅ **Team Member Cards** - All team views

### 4. **Predefined Avatar Styles**
**Male Avatars:**
1. Professional - Business casual with short hair
2. Executive - Formal blazer with styled hair
3. Creative - Casual sweater with dreads
4. Casual - Crew neck with curly hair and beard
5. Trendy - Hat and graphic shirt

**Female Avatars:**
1. Professional - Business blazer with straight hair
2. Executive - Formal attire with bob cut
3. Creative - Casual sweater with curly hair
4. Casual - Scoop neck with bun
5. Trendy - Hoodie with wavy hair

---

## 🔧 Technical Implementation

### Storage Key Format
```javascript
avatar_${email || displayName}
```

### Storage Structure
```json
{
  "avatarId": "male-1",  // or "female-3" or "custom"
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=..."
  // For custom uploads, avatarUrl is a base64 data URL
}
```

### Component Architecture

#### 1. **UserAvatar Component** (`frontend/src/components/UserAvatar.tsx`)
- Loads avatar from localStorage automatically
- Listens for storage events to update in real-time
- Falls back to default avatar if no selection exists
- Priority system:
  1. Custom URL (from PersonalDashboard state)
  2. Custom uploaded image (base64 from localStorage)
  3. Predefined avatar (by ID from localStorage)
  4. Generated default (deterministic from name)

#### 2. **AvatarPicker Component** (`frontend/src/components/AvatarPicker.tsx`)
- Tabbed modal dialog with 3 tabs:
  - **Male Avatars**: Grid of 5 male avatars
  - **Female Avatars**: Grid of 5 female avatars
  - **Upload Custom**: File upload interface
- Visual selection with checkmarks
- File validation (max 2MB, image types only)
- Converts uploaded images to base64 for storage

#### 3. **Avatar Generator** (`frontend/src/utils/avatarGenerator.ts`)
- Defines 10 predefined avatars with DiceBear URLs
- Provides helper functions:
  - `getAvatarById(id)`: Get avatar by ID
  - `getDefaultAvatar(name)`: Get deterministic default avatar

#### 4. **PersonalDashboard** (`frontend/src/pages/PersonalDashboard.tsx`)
- Displays avatar with edit button
- Manages avatar state (avatarId, avatarUrl)
- Triggers storage events on save for cross-component updates

---

## 🚀 How to Use

### For Users:

1. **Login** to your account
2. **Navigate** to PersonalDashboard
3. **Click** the edit icon (✏️) on your avatar
4. **Choose your avatar**:
   - **Tab 1 (Male Avatars)**: Click on any of the 5 male avatars
   - **Tab 2 (Female Avatars)**: Click on any of the 5 female avatars
   - **Tab 3 (Upload Custom)**: Click "Upload Image" and select your own picture
5. **Click "Save Avatar"** to persist your selection
6. **Navigate** to other dashboards - your avatar appears everywhere!

### For Developers:

#### Using UserAvatar Component:
```tsx
import UserAvatar from '../components/UserAvatar';

<UserAvatar
  name={manager.displayName}
  email={manager.email}
  sx={{ width: 48, height: 48 }}
/>
```

#### Adding Avatar Picker:
```tsx
import AvatarPicker from '../components/AvatarPicker';

const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
const [avatarId, setAvatarId] = useState<string>('');
const [avatarUrl, setAvatarUrl] = useState<string>('');

<AvatarPicker
  open={avatarPickerOpen}
  onClose={() => setAvatarPickerOpen(false)}
  onSave={(id, url) => {
    setAvatarId(id);
    setAvatarUrl(url);
    // Save to localStorage
  }}
  currentAvatarId={avatarId}
  currentAvatarUrl={avatarUrl}
  userName={userName}
/>
```

---

## 🐛 Debugging

### Console Logs
The system includes helpful console logs:
- `🎨 Using custom avatar URL for [name]` - Using PersonalDashboard state
- `📷 Loaded custom uploaded image for [name]` - Found custom upload
- `💾 Loaded predefined avatar for [name]: [style]` - Found saved selection
- `💾 Loaded saved avatar URL for [name]` - Found saved URL
- `🎲 Generating default avatar for [name]` - No selection found
- `✅ Avatar saved!` - Selection saved successfully

### Check localStorage
Open browser DevTools → Application → Local Storage → `http://localhost:3001`
Look for keys like: `avatar_user@email.com` or `avatar_John Doe`

Example stored data:
```json
{
  "avatarId": "male-2",
  "avatarUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=male2&..."
}
```

Or for custom uploads:
```json
{
  "avatarId": "custom",
  "avatarUrl": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### Verify Storage Event
After saving, check console for: `✅ Avatar saved!` with details

---

## 🔄 Migration to Backend (Future)

Currently using localStorage. To migrate to backend:

1. **Add avatar fields to Manager entity**:
```java
private String avatarId;  // "male-1", "female-3", or "custom"
private String avatarUrl; // DiceBear URL or base64 data URL
```

2. **Create API endpoints**:
```
POST /api/managers/{id}/avatar
GET /api/managers/{id}/avatar
```

3. **Update frontend to use API**:
```typescript
const handleSaveAvatar = async (id: string, url: string) => {
  await managerApi.updateAvatar(managerId, { avatarId: id, avatarUrl: url });
  setAvatarId(id);
  setAvatarUrl(url);
};
```

4. **Consider storage optimization for custom uploads**:
- Store custom images in cloud storage (S3, Cloudinary)
- Save only the URL reference in the database
- Implement image compression before upload

---

## 📝 Testing Checklist

### Test Predefined Avatars
- [ ] Login as a user
- [ ] Navigate to PersonalDashboard
- [ ] Click edit icon (✏️) on avatar
- [ ] Click "Male Avatars" tab
- [ ] Select a male avatar (should show checkmark)
- [ ] Click "Save Avatar"
- [ ] Verify console shows: `✅ Avatar saved!`
- [ ] Navigate to UserDashboard
- [ ] Verify selected avatar appears in leaderboard
- [ ] Refresh page
- [ ] Verify avatar persists after refresh

### Test Custom Upload
- [ ] Click edit icon on avatar
- [ ] Click "Upload Custom" tab
- [ ] Click "Upload Image" button
- [ ] Select an image file (< 2MB)
- [ ] Verify preview shows uploaded image
- [ ] Click "Save Avatar"
- [ ] Verify custom image appears in PersonalDashboard
- [ ] Navigate to other dashboards
- [ ] Verify custom image appears everywhere

### Test Persistence
- [ ] Open browser DevTools → Application → Local Storage → `http://localhost:3001`
- [ ] Verify `avatar_[user]` key exists
- [ ] Verify data structure: `{ "avatarId": "...", "avatarUrl": "..." }`
- [ ] Close and reopen browser
- [ ] Verify avatar selection persists

### Test File Validation
- [ ] Try uploading file > 2MB (should show error)
- [ ] Try uploading non-image file (should show error)
- [ ] Try uploading valid image (should work)

---

**Last Updated**: 2026-03-18

