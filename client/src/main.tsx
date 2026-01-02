import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./admin-theme.css";
import "leaflet/dist/leaflet.css";
// Config is imported to trigger the initialization log
import "./lib/config";

createRoot(document.getElementById("root")!).render(<App />);
