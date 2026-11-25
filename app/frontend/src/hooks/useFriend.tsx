import { useEffect, useState } from "react";
import { type FriendStatus } from "shared";
import { socialSocket as socket } from "../sockets/socialSocket.tsx";

export function useFriend(): FriendStatus[] | null {
  const [friends, setFriends] = useState<FriendStatus[] | null>(null);

  useEffect(() => {
    const onConnect = () => {
      socket.emit("friend:list");
    };

    socket.on("friend:update", setFriends);
    socket.on("connect", onConnect);
    if (socket.connected) onConnect();

    return () => {
      socket.off("connect", onConnect);
      socket.off("friend:update", setFriends);
    };
  }, []);
  return friends;
}
