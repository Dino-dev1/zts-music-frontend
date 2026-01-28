"use client";

import { getFirebaseApp, getFirebaseAuth } from "./config";

// Initialize Firebase when this module is imported
if (typeof window !== "undefined") {
  try {
    const app = getFirebaseApp();
    if (app) {
      // Also initialize Auth
      getFirebaseAuth();
    }
  } catch (error) {
    console.error("Failed to initialize Firebase:", error);
  }
}
