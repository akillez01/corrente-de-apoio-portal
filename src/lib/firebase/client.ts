import { getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { connectAuthEmulator, GoogleAuthProvider, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps()[0] ?? initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

declare global {
  // eslint-disable-next-line no-var
  var __cdaEmulatorsConnected: boolean | undefined;
  // eslint-disable-next-line no-var
  var __cdaAppCheckInitialized: boolean | undefined;
}

const useEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";

if (useEmulators && !globalThis.__cdaEmulatorsConnected) {
  // Em HMR/reloads parciais o app pode ja existir; conectamos os emuladores
  // aqui de forma idempotente para evitar fallback acidental para producao.
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  globalThis.__cdaEmulatorsConnected = true;
}

// App Check anexa um token de atestação (reCAPTCHA v3) a toda chamada do SDK
// cliente para o Firebase Auth, barrando automação/bot de sign-up. Só roda no
// navegador (nunca durante build/SSR) e é pulado no emulador local.
const appCheckSiteKey = process.env.NEXT_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
if (
  typeof window !== "undefined" &&
  !useEmulators &&
  appCheckSiteKey &&
  !globalThis.__cdaAppCheckInitialized
) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
  globalThis.__cdaAppCheckInitialized = true;
}
