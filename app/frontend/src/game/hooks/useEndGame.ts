import { useEffect } from "react";
import { useNavigate } from "react-router";

const DELAY = 10000;

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
      navigate("/home", { replace: true });
    }, DELAY);

    return () => clearTimeout(timer);
  }, [isGameOver, navigate]);
}
