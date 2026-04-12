import { ThemeProvider } from "./components/theme-context";
import { RouterProvider } from "react-router";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
