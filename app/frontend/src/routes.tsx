
import { createBrowserRouter } from "react-router";

import MainShell from './components/MainShell';
import AppLayout from "./layouts/AppLayout"

import  HomePage  from "./pages/HomePage"
import ProfilePage from "./pages/ProfilePage";
import StatsPage from "./pages/StatsPage";
import NotFoundPage from "./pages/NotFoundPage";


export const router = createBrowserRouter([
	{
		Component: AppLayout,
		children:[
			{ path: "home", Component: HomePage },
			{ path: "profile", Component: ProfilePage },
			{ path: "stats", Component: StatsPage },
		],
	},

	{ path: "/", Component: MainShell },
	{ path: "*", Component: NotFoundPage },
]);
