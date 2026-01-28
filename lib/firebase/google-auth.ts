import {
  GoogleAuthProvider,
  type UserCredential,
  getIdToken,
  signInWithPopup,
} from "firebase/auth";
import { getFirebaseAuth, getFirebaseStatus } from "./config";

export interface GoogleSignInResult {
  idToken: string;
  user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
  };
}

/**
 * Check if Google Auth is available
 */
export function isGoogleAuthAvailable(): { available: boolean; error?: string } {
  const status = getFirebaseStatus();
  if (!status.isReady) {
    return {
      available: false,
      error: status.error || "Firebase is not initialized",
    };
  }
  return { available: true };
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const auth = getFirebaseAuth();

  if (!auth) {
    throw new Error("Firebase Auth is not initialized. Please check your Firebase configuration.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  try {
    const result: UserCredential = await signInWithPopup(auth, provider);
    const idToken = await getIdToken(result.user);

    return {
      idToken,
      user: {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
      },
    };
  } catch (error) {
    const authError = error as { code?: string; message?: string };
    if (authError.code === "auth/popup-closed-by-user") {
      throw new Error("Sign-in popup was closed. Please try again.");
    }
    if (authError.code === "auth/popup-blocked") {
      throw new Error("Popup was blocked by your browser. Please allow popups for this site.");
    }
    throw new Error(authError.message || "Google Sign-In failed");
  }
}
