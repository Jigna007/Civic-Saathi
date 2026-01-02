import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./admin-theme.css";
import "leaflet/dist/leaflet.css";

// Debug: Log environment configuration
console.log("[CivicSaathi] API_BASE_URL:", import.meta.env.VITE_API_URL || "(not set - using same origin)");

createRoot(document.getElementById("root")!).render(<App />);
