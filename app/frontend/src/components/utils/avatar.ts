const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export function getAvatarSrc(avatarURL?: string | null): string {
  if (!avatarURL) return "/avatars/default.jpg";
  if (avatarURL.startsWith("http://") || avatarURL.startsWith("https://")) {
    return avatarURL;
  }
  return `${API_URL}${avatarURL}`;
}
