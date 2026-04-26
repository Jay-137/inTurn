import { Outlet } from "react-router-dom";
import { AppProvider } from "./app-context";
import { Toaster } from "sonner";

export function AppProviderLayout() {
  return (
    <AppProvider>
      <Outlet />
      <Toaster position="top-center" richColors />
    </AppProvider>
  );
}
