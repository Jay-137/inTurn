import { Outlet } from "react-router-dom";
import { AppProvider } from "./app-context";

export function AppProviderLayout() {
  return (
    <AppProvider>
      <Outlet />
    </AppProvider>
  );
}
