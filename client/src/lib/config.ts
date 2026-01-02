// API configuration for different environments
// This file centralizes API URL configuration for easy debugging

// In production, VITE_API_URL should be set to the Railway backend URL
// e.g., "https://web-production-14e5.up.railway.app"
const VITE_API_URL = import.meta.env.VITE_API_URL;

// Fallback for production if env var is not set during build
const PRODUCTION_BACKEND_URL = "https://web-production-14e5.up.railway.app";

// Determine if we're in production
const isProduction = import.meta.env.PROD;

// Use VITE_API_URL if available, otherwise use fallback in production
export const API_BASE_URL = VITE_API_URL || (isProduction ? PRODUCTION_BACKEND_URL : "");

// Log configuration for debugging (only in development or when there are issues)
if (isProduction) {
  console.log("[Config] Production mode detected");
  console.log("[Config] VITE_API_URL:", VITE_API_URL || "(not set)");
  console.log("[Config] Using API_BASE_URL:", API_BASE_URL);
}
