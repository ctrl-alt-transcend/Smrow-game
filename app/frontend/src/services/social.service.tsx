import { http } from "./http";
import { type Friend, FriendSchema } from "shared";
import { z } from "zod";

export const getFriendList = async (): Promise<Friend[]> => {
  const res = await http.get("/user/friendlist");
  return z.array(FriendSchema).parse(res.data);
};

export async function removeFriend(friendId: string): Promise<void> {
  const res = await http.delete(`user/friends/${encodeURIComponent(friendId)}`);
  return res.data;
}
