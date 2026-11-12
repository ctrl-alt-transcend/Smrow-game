import { http } from "./http";
import { UpdateProfileSchema, UserProfileSchema } from "shared";
import type { AxiosResponse } from "axios";
import type { UserProfile, UpdateProfile } from "shared";

export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const res: AxiosResponse = await http.get<UserProfile>("/auth/me");
    return res.data;
  } catch (error: any) {
    const err_msg = error.repsones?.data?.message;
    throw err_msg;
  }
};

export function getUserToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Not authenticated");
  return token;
}

export async function updateProfile(data: UpdateProfile): Promise<UserProfile> {
  const tosend: UpdateProfile = UpdateProfileSchema.parse(data);
  const res = await http.patch("/auth/me", tosend);
  return UserProfileSchema.parse(res.data);
}
