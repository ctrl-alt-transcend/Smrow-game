
import { createBrowserRouter } from "react-router";
import NotFoundPage from "./pages/NotFoundPage";
import MainShell from './components/MainShell';



export const router = createBrowserRouter([

	{path: "/", Component: MainShell},
	{path: "*", Component: NotFoundPage},
]);

