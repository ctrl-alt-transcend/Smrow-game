import { http } from "./http";
import { UpdateProfileSchema, UserProfileSchema } from "shared";
import type { AxiosResponse } from "axios";
import type { UserProfile, UpdateProfile } from "shared";

export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const res: AxiosResponse = await http.get<UserProfile>("/auth/me");
    return res.data;
  } catch (error: any) {
    const err_msg = error.responses?.data?.message;
    throw err_msg;
  }
};

export function getUserToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function updateProfile(
  identifier: string,
  data: UpdateProfile,
): Promise<UserProfile> {
  try {
    const payload: UpdateProfile = UpdateProfileSchema.parse(data);
    const res = await http.patch(
      `/user/update/${encodeURIComponent(identifier)}`,
      payload,
    );
    return UserProfileSchema.parse(res.data.user);
  } catch (error: any) {
    const apiMessage = error?.response?.data?.message;
    if (apiMessage) {
      throw new Error(
        Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage,
      );
    }
    throw error instanceof Error ? error : new Error("Unexpected error");
  }
}
