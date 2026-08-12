import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { WeddingProject, Guest, Table, Task, Vendor, BudgetItem, FileDoc, ActivityLog, EmailCampaign } from '../types';

let WEDDING_DOC_ID = 'current_wedding';

export const setFirestoreEmail = (email: string) => {
  if (email && email.trim() !== '') {
    // Firestore doc IDs can't contain forward slashes, but emails don't have them.
    WEDDING_DOC_ID = email.trim().toLowerCase();
  }
};

// Helper to remove undefined properties before saving to Firestore
const sanitizeForFirestore = (data: any): any => {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(sanitizeForFirestore);
  }
  const sanitized: Record<string, any> = {};
  for (const key of Object.keys(data)) {
    const val = data[key];
    if (val !== undefined) {
      sanitized[key] = sanitizeForFirestore(val);
    }
  }
  return sanitized;
};

export const syncWeddingToFirestore = async (wedding: WeddingProject) => {
  if (window.__ADMIN_PREVIEW_MODE__) return;
  if (!isFirebaseConfigured || !db || WEDDING_DOC_ID === 'current_wedding') return;
  try {
    await setDoc(doc(db, 'weddings', WEDDING_DOC_ID), sanitizeForFirestore(wedding), { merge: true });
  } catch (err) {
    console.error('Error syncing wedding to Firestore:', err);
  }
};

export const syncCollectionToFirestore = async (collectionName: string, items: any[]) => {
  if (window.__ADMIN_PREVIEW_MODE__) return;
  if (!isFirebaseConfigured || !db || WEDDING_DOC_ID === 'current_wedding') return;
  try {
    await setDoc(doc(db, 'weddings', WEDDING_DOC_ID, 'collections', collectionName), { items: sanitizeForFirestore(items) }, { merge: true });
  } catch (err) {
    console.error(`Error syncing ${collectionName} to Firestore:`, err);
  }
};

export const loadWeddingFromFirestore = async (): Promise<WeddingProject | null> => {
  if (!isFirebaseConfigured || !db || WEDDING_DOC_ID === 'current_wedding') return null;
  try {
    const snap = await getDoc(doc(db, 'weddings', WEDDING_DOC_ID));
    if (snap.exists()) {
      return snap.data() as WeddingProject;
    }
  } catch (err) {
    console.error('Error loading wedding from Firestore:', err);
  }
  return null;
};

export const loadCollectionFromFirestore = async <T>(collectionName: string): Promise<T[] | null> => {
  if (!isFirebaseConfigured || !db || WEDDING_DOC_ID === 'current_wedding') return null;
  try {
    const snap = await getDoc(doc(db, 'weddings', WEDDING_DOC_ID, 'collections', collectionName));
    if (snap.exists()) {
      return snap.data().items as T[];
    }
  } catch (err) {
    console.error(`Error loading ${collectionName} from Firestore:`, err);
  }
  return null;
};
