import { http } from "./http";
import { type Friend, FriendSchema, type Username } from "shared";
import { z } from "zod";

// export const getFriendList = (friends: Friend[]): Friend[] => {
//   // const res = await http.get("/user/friendlist");
//   return z.array(FriendSchema).parse(friends);
// };

export const getPendingList = async (): Promise<Friend[]> => {
  const res = await http.get("user/pendinglist");
  return z.array(FriendSchema).parse(res.data);
};

export async function removeFriend(friendId: string): Promise<void> {
  const res = await http.delete(
    `user/friends/remove/${encodeURIComponent(friendId)}`,
  );
  return res.data;
}

export async function addFriend(username: Username): Promise<void> {
  const res = await http.post(
    `user/friends/add/${encodeURIComponent(username)}`,
  );
  return res.data;
}

export async function denyRequest(id: string): Promise<void> {
  const res = await http.patch(`user/friends/deny/${encodeURIComponent(id)}`);
  return res.data;
}

export async function acceptRequest(id: string): Promise<void> {
  const res = await http.patch(`user/friends/accept/${encodeURIComponent(id)}`);
  return res.data;
}
