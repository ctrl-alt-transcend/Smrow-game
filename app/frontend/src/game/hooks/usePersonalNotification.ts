import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import type { GameLog } from "shared";

export function usePersonalNotification(log: GameLog) {
  const lastNotifiedId = useRef<number>(-1);

  useEffect(() => {
    if (log.id <= lastNotifiedId.current) return;
    lastNotifiedId.current = log.id;
    notifications.show({ message: log.message });
  }, [log]);
}
