import { authEvents } from "../context/AuthEvents";

/**
 * Socket.io doesn't retry after a middleware refusal:
 * an expired token leaves the socket dead, so we logout the user.
 */
export function logoutOnError(err: Error) {
  if (err.message !== "Authentication error") return;
  authEvents.dispatchEvent(
    new CustomEvent("logout", { detail: "Your session has expired." }),
  );
}
