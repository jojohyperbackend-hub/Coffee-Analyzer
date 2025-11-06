
// Client-side Firebase helpers: init app, Google sign-in, id token, auth listeners

import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getIdToken,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

/**
 * Sign in with Google using a popup.
 * Returns { user, idToken } on success.
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const idToken = await getIdToken(user, /* forceRefresh= */ false);
    return { user, idToken };
  } catch (err) {
    throw err;
  }
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return true;
  } catch (err) {
    throw err;
  }
}

/**
 * Get the currently signed-in user (or null).
 */
export function getCurrentUser() {
  return auth.currentUser || null;
}

/**
 * Get ID token for the current user (returns null if no user).
 */
export async function getCurrentUserIdToken(forceRefresh = false) {
  const user = auth.currentUser;
  if (!user) return null;
  return await getIdToken(user, forceRefresh);
}

/**
 * Subscribe to auth state changes.
 * callback receives the Firebase user or null.
 * Returns an unsubscribe function.
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export { auth };
