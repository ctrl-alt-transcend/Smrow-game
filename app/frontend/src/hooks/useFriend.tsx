import { useEffect, useState } from "react";
import { type FriendStatus } from "shared";
import { socialSocket as socket } from "../sockets/socialSocket.tsx";

export function useFriend(): FriendStatus[] | null {
  const [friends, setFriends] = useState<FriendStatus[] | null>(null);

  useEffect(() => {
    socket.on("friend: update", setFriends);
    socket.emit("friend: list");
    console.log("useFriend: socket emit friend: list");

    return () => {
      socket.off("friend: updateList", setFriends);
    };
  }, []);
  console.log("useFriend: friends =", friends);
  return friends;
}
