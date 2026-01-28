// Re-export all Firebase functionality
export { getFirebaseApp, getFirebaseAuth, getFirebaseStatus } from './config'
export { getFirebaseWebConfig, getFirebaseProjectId } from './firebase-config'
export { signInWithGoogle, isGoogleAuthAvailable, type GoogleSignInResult } from './google-auth'
export {
  initRecaptcha,
  sendOtp,
  verifyOtp,
  resetPhoneAuth,
  isOtpRequested,
  isPhoneAuthAvailable,
  type PhoneSignInResult,
  type RecaptchaInitResult,
} from './phone-auth'

// Initialize Firebase on import
import './init'
