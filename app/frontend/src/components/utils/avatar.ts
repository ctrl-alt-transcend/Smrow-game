const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function getAvatarSrc(avatarURL?: string | null): string {
  if (!avatarURL) return '/default-avatar.png';
  return `${API_URL}${avatarURL}`;
}