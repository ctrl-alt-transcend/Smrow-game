import { useEffect } from "react";
import { useNavigate } from "react-router";

const DELAY = 3000;

/**
 * @brief Custom hook to handle the end of the game and navigate to the homepage after 10 secondes.
 */
export function useEndGame(isGameOver: boolean) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isGameOver) {
      return;
    }
    const timer = setTimeout(() => {
      //TODO: socket.emit(leaveGame) to notify the server that the player has left the game
      navigate("/home", { replace: true });
    }, DELAY);

    return () => clearTimeout(timer);
  }, [isGameOver, navigate]);
}
