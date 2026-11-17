import { notifications } from "@mantine/notifications";
import { useEffect, useRef } from "react";
import type { GameLog } from "shared";

export function usePersonalNotification(logs: GameLog[]) {
  const lastNotifiedId = useRef<number>(-1);

  useEffect(() => {
    const pending = logs.filter((log) => log.id > lastNotifiedId.current);
    if (pending.length === 0) return;
    lastNotifiedId.current = pending[pending.length - 1].id;
    for (const log of pending) {
      notifications.show({
        message: log.message,
        color: log.color,
      });
    }
  }, [logs]);
}
