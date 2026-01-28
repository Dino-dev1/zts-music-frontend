import {
  type ConfirmationResult,
  RecaptchaVerifier,
  getIdToken,
  signInWithPhoneNumber,
} from "firebase/auth";
import { getFirebaseAuth, getFirebaseStatus } from "./config";

// Store confirmation result for OTP verification
let confirmationResult: ConfirmationResult | null = null;
let recaptchaVerifier: RecaptchaVerifier | null = null;

export interface PhoneSignInResult {
  idToken: string;
  user: {
    uid: string;
    phoneNumber: string | null;
  };
}

export interface RecaptchaInitResult {
  success: boolean;
  verifier: RecaptchaVerifier | null;
  error?: string;
}

/**
 * Check if Firebase phone auth is available
 */
export function isPhoneAuthAvailable(): { available: boolean; error?: string } {
  const status = getFirebaseStatus();
  if (!status.isReady) {
    return {
      available: false,
      error: status.error || "Firebase is not initialized",
    };
  }
  return { available: true };
}

/**
 * Initialize reCAPTCHA verifier for phone auth
 * Must be called before sendOtp
 */
export function initRecaptcha(buttonId: string): RecaptchaInitResult {
  const status = getFirebaseStatus();
  if (!status.isReady) {
    return {
      success: false,
      verifier: null,
      error: status.error || "Firebase Auth is not initialized. Please check your configuration.",
    };
  }

  const auth = getFirebaseAuth();
  if (!auth) {
    return {
      success: false,
      verifier: null,
      error: "Firebase Auth could not be initialized.",
    };
  }

  // Clean up existing verifier
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {
      // Ignore cleanup errors
    }
    recaptchaVerifier = null;
  }

  try {
    recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved - will proceed with phone auth
      },
      "expired-callback": () => {
        // Reset reCAPTCHA if expired
        console.log("reCAPTCHA expired");
      },
    });
    return { success: true, verifier: recaptchaVerifier };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to initialize reCAPTCHA";
    return { success: false, verifier: null, error: message };
  }
}

/**
 * Send OTP to phone number
 * Returns true if OTP was sent successfully
 */
export async function sendOtp(phoneNumber: string): Promise<boolean> {
  const auth = getFirebaseAuth();
  if (!auth) {
    throw new Error("Firebase Auth is not initialized");
  }

  if (!recaptchaVerifier) {
    throw new Error("reCAPTCHA not initialized. Call initRecaptcha first.");
  }

  // Validate phone number format (basic validation)
  if (!phoneNumber.startsWith("+")) {
    throw new Error("Phone number must include country code (e.g., +91)");
  }

  try {
    confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return true;
  } catch (error) {
    const authError = error as { code?: string; message?: string };
    // Reset reCAPTCHA on error
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    if (authError.code === "auth/invalid-phone-number") {
      throw new Error("Invalid phone number format");
    }
    if (authError.code === "auth/too-many-requests") {
      throw new Error("Too many requests. Please try again later.");
    }
    if (authError.code === "auth/captcha-check-failed") {
      throw new Error("reCAPTCHA verification failed. Please try again.");
    }
    throw new Error(authError.message || "Failed to send OTP");
  }
}

/**
 * Verify OTP and get Firebase ID token
 */
export async function verifyOtp(otp: string): Promise<PhoneSignInResult> {
  if (!confirmationResult) {
    throw new Error("No OTP request in progress. Please request OTP first.");
  }

  try {
    const result = await confirmationResult.confirm(otp);
    const idToken = await getIdToken(result.user);

    // Clear state after successful verification
    confirmationResult = null;
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }

    return {
      idToken,
      user: {
        uid: result.user.uid,
        phoneNumber: result.user.phoneNumber,
      },
    };
  } catch (error) {
    const authError = error as { code?: string; message?: string };
    if (authError.code === "auth/invalid-verification-code") {
      throw new Error("Invalid OTP. Please check and try again.");
    }
    if (authError.code === "auth/code-expired") {
      throw new Error("OTP has expired. Please request a new one.");
    }
    throw new Error(authError.message || "OTP verification failed");
  }
}

/**
 * Reset phone auth state (call when canceling or on error)
 */
export function resetPhoneAuth(): void {
  confirmationResult = null;
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

/**
 * Check if OTP has been requested
 */
export function isOtpRequested(): boolean {
  return confirmationResult !== null;
}
