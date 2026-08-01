import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, GoogleAuthProvider, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const alreadyInitialized = getApps().length > 0;
const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

declare global {
  // eslint-disable-next-line no-var
  var __cdaEmulatorsConnected: boolean | undefined;
}

if (
  !alreadyInitialized &&
  process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" &&
  !globalThis.__cdaEmulatorsConnected
) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  globalThis.__cdaEmulatorsConnected = true;
}
