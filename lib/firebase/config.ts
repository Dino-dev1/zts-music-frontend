import { type FirebaseApp, type FirebaseOptions, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { getFirebaseWebConfig } from "./firebase-config";

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let initializationError: string | null = null;
let isInitialized = false;

function getFirebaseOptions(): FirebaseOptions | null {
  return getFirebaseWebConfig();
}

export interface FirebaseStatus {
  isReady: boolean;
  isInitialized: boolean;
  error: string | null;
}

/**
 * Get the current Firebase initialization status
 */
export function getFirebaseStatus(): FirebaseStatus {
  if (typeof window === "undefined") {
    return { isReady: false, isInitialized: false, error: "Server-side rendering" };
  }

  // Try to initialize if not attempted yet
  if (!isInitialized && !initializationError) {
    getFirebaseApp();
  }

  return {
    isReady: app !== null && auth !== null,
    isInitialized,
    error: initializationError,
  };
}

export function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === "undefined") return null;

  const firebaseOptions = getFirebaseOptions();
  if (!firebaseOptions) {
    initializationError =
      "Firebase configuration is missing. Please check your environment variables " +
      "(NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID).";
    isInitialized = true;
    return null;
  }

  if (!app) {
    try {
      const apps = getApps();
      if (apps.length > 0) {
        app = apps[0];
      } else {
        app = initializeApp(firebaseOptions);
      }
      isInitialized = true;
      initializationError = null;
    } catch (error) {
      initializationError =
        error instanceof Error ? error.message : "Failed to initialize Firebase";
      isInitialized = true;
      return null;
    }
  }

  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (typeof window === "undefined") return null;

  if (!auth) {
    const firebaseApp = getFirebaseApp();
    if (!firebaseApp) return null;
    try {
      auth = getAuth(firebaseApp);
    } catch (error) {
      initializationError =
        error instanceof Error ? error.message : "Failed to initialize Firebase Auth";
      return null;
    }
  }

  return auth;
}
