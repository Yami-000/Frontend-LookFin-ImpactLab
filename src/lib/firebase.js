import { getApp, getApps, initializeApp } from 'firebase/app';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
};

const requiredKeys = [
  ['apiKey', firebaseConfig.apiKey],
  ['authDomain', firebaseConfig.authDomain],
  ['projectId', firebaseConfig.projectId],
  ['appId', firebaseConfig.appId],
];

export const missingFirebaseKeys = requiredKeys.filter(([, value]) => !value).map(([key]) => key);

const firebaseApp = missingFirebaseKeys.length === 0
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

export const auth = firebaseApp ? getAuth(firebaseApp) : null;

export const prepareAuthPersistence = async () => {
  if (!auth) {
    throw new Error('Firebase no está configurado. Revisa las variables VITE_FIREBASE_* en el frontend.');
  }

  await setPersistence(auth, browserLocalPersistence);
  return auth;
};
