import { http } from "./http";
import type { AxiosResponse } from "axios";
import { type UserPublic, type Friend, FriendSchema } from "shared";
import { z } from "zod";

export const getCurrentUser = async (): Promise<UserPublic> => {
  try {
    const res: AxiosResponse = await http.get<UserPublic>("/auth/me");
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

export const getFriendList = async (): Promise<Friend[]> => {
  const res = await http.get("/user/friendlist");
  return z.array(FriendSchema).parse(res.data);
};
