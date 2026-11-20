import { createBrowserRouter } from "react-router";

import GameShell from "../game/GameShell";
import AppLayout from "../layouts/AppLayout";
import MainShell from "../components/MainShell";

import HomePage from "../pages/HomePage";
import ProfilePage from "../pages/ProfilePage";
import StatsPage from "../pages/StatsPage";
import NotFoundPage from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import PublicProfilePage from "../pages/PublicProfilePage";

export const router = createBrowserRouter([
  { path: "/", Component: MainShell },
  {
    element: <ProtectedRoute />,
    children: [
      {
        Component: AppLayout,
        children: [
          { path: "home", Component: HomePage },
          { path: "profile", Component: ProfilePage },
          { path: "stats", Component: StatsPage },
          { path: ":username", Component: PublicProfilePage },
        ],
      },
      { path: "/game", Component: GameShell },
    ],
  },
  { path: "*", Component: NotFoundPage },
]);
