import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC6PbdmcerdE8uIXHIxQed7E1xu5qhO0EI",
  authDomain: "wedtrack-os.firebaseapp.com",
  projectId: "wedtrack-os",
  storageBucket: "wedtrack-os.firebasestorage.app",
  messagingSenderId: "713095389621",
  appId: "1:713095389621:web:20569b4318a79863b3f9fc",
  measurementId: "G-TM4M6ZXE5J"
};

export const isFirebaseConfigured = true;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.warn('Firebase init fallback active:', error);
}

export { app, auth, db, storage };
