import { createBrowserRouter } from "react-router";
import { HomePage } from "./components/home-page";
import { InstitutionsPage } from "./components/institutions-page";
import { GetStartedPage } from "./components/get-started-page";
import { LoginPage } from "./components/login-page";
import { InstitutionDashboard } from "./components/institution-dashboard";
import { RecruiterDashboard } from "./components/recruiter-dashboard";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/institutions", Component: InstitutionsPage },
  { path: "/get-started", Component: GetStartedPage },
  { path: "/login", Component: LoginPage },
  { path: "/institution-dashboard", Component: InstitutionDashboard },
  { path: "/recruiter-dashboard", Component: RecruiterDashboard },
  { path: "*", Component: HomePage },
]);