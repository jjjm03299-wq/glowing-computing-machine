import { createRoot } from "react-dom/client";
import App from "./App";
import { installMockApi } from "./lib/mockClient";
import "./index.css";

// Production-safe mock: intercepts /api/* fetches with the same handlers
// MSW uses in development, so behavior is identical on GitHub Pages.
installMockApi();

createRoot(document.getElementById("root")!).render(<App />);
