import { createBrowserRouter } from "react-router-dom";
import { LandingPage } from "./components/landing-page";
import { Layout } from "./components/layout";
import { CandidateDashboard } from "./components/candidate-dashboard";
import { LinkSkillProof } from "./components/link-skill-proof";
import { SkillProfile } from "./components/skill-profile";
import { JobMatches } from "./components/job-matches";
import { AppProviderLayout } from "./components/app-provider-layout";
import { StudentAuthPage } from "./components/student-auth-page";
import { StudentData } from "./components/student-data";

export const router = createBrowserRouter([
  {
    Component: AppProviderLayout,
    children: [
      {
        path: "/",
        Component: LandingPage,
      },
      {
        // Login / register page
        path: "/login",
        Component: StudentAuthPage,
      },
      {
        // Protected student area — Layout component handles auth guard
        path: "/student",
        Component: Layout,
        children: [
          { index: true, Component: CandidateDashboard },
          { path: "link", Component: LinkSkillProof },
          { path: "profile", Component: SkillProfile },
          { path: "placements", Component: JobMatches },
          { path: "data", Component: StudentData },
        ],
      },
    ],
  },
]);