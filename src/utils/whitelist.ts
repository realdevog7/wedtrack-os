import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface WhitelistRecord {
  email: string;
  orderId: string;
  createdAt: string;
  status?: 'active' | 'revoked';
}

const LOCAL_WHITELIST_KEY = 'aethelgard_whitelisted_emails';

// Default emails that are always whitelisted for dev/testing
const DEFAULT_WHITELIST = [
  'admin@aethelgard.com',
  'sophia@example.com',
  'demo@example.com',
  'test@etsy.com',
];

/**
 * Get all whitelisted emails from local storage (and Firestore if configured)
 */
export const getWhitelistedEmails = async (): Promise<WhitelistRecord[]> => {
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  let records: WhitelistRecord[] = localData ? JSON.parse(localData) : [];

  // Add default testing records if they don't exist yet
  DEFAULT_WHITELIST.forEach((email) => {
    if (!records.some((r) => r.email === email)) {
      records.push({
        email,
        orderId: 'SYSTEM-DEFAULT',
        createdAt: new Date().toISOString(),
        status: 'active',
      });
    }
  });

  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, 'whitelisted_users'));
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as WhitelistRecord;
        if (!records.some((r) => r.email === docSnap.id)) {
          records.push({
            email: docSnap.id,
            orderId: data.orderId || 'ETSY-AUTO',
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'active',
          });
        }
      });
    } catch (err) {
      console.error('Error fetching whitelist from Firestore:', err);
    }
  }

  return records;
};

/**
 * Check if an email address is allowed to onboarding/access the application
 */
export const checkEmailWhitelist = async (
  rawEmail: string
): Promise<{ allowed: boolean; reason?: string }> => {
  const email = rawEmail.trim().toLowerCase();

  if (!email) {
    return { allowed: false, reason: 'Please enter a valid email address.' };
  }

  // 1. Check default test emails
  if (DEFAULT_WHITELIST.includes(email)) {
    return { allowed: true };
  }

  // 2. Check local storage whitelist
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  if (localData) {
    const records: WhitelistRecord[] = JSON.parse(localData);
    const found = records.find((r) => r.email === email && r.status !== 'revoked');
    if (found) {
      return { allowed: true };
    }
  }

  // 3. Check Firestore (where Google Forms / Apps Script writes the data)
  if (isFirebaseConfigured && db) {
    try {
      const docRef = doc(db, 'whitelisted_users', email);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status === 'revoked') {
          return {
            allowed: false,
            reason: 'Your access has been revoked. Please contact support.',
          };
        }
        // Cache in local storage for offline speed next time
        await addWhitelistedEmailToLocal(email, data.orderId || 'ETSY-AUTO');
        return { allowed: true };
      }
    } catch (err) {
      console.error('Error checking Firestore whitelist:', err);
    }
  }

  return {
    allowed: false,
    reason:
      'This email address is not yet activated. Please ensure you entered the exact email registered with your Etsy purchase, or contact the seller for access.',
  };
};

/**
 * Add a new email to the whitelist (used by Admin testing panel or manual overrides)
 */
export const addWhitelistedEmail = async (
  rawEmail: string,
  orderId: string = 'MANUAL-ADD'
): Promise<void> => {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return;

  await addWhitelistedEmailToLocal(email, orderId);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'whitelisted_users', email), {
        email,
        orderId,
        createdAt: new Date().toISOString(),
        status: 'active',
      });
    } catch (err) {
      console.error('Error adding email to Firestore whitelist:', err);
    }
  }
};

const addWhitelistedEmailToLocal = async (email: string, orderId: string) => {
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  const records: WhitelistRecord[] = localData ? JSON.parse(localData) : [];
  
  if (!records.some((r) => r.email === email)) {
    records.push({
      email,
      orderId,
      createdAt: new Date().toISOString(),
      status: 'active',
    });
    localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(records));
  }
};

/**
 * Remove an email from the whitelist
 */
export const deleteWhitelistedEmail = async (rawEmail: string): Promise<void> => {
  const email = rawEmail.trim().toLowerCase();
  
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  if (localData) {
    const records: WhitelistRecord[] = JSON.parse(localData);
    const filtered = records.filter((r) => r.email !== email);
    localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(filtered));
  }

  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'whitelisted_users', email));
    } catch (err) {
      console.error('Error deleting email from Firestore whitelist:', err);
    }
  }
};

/**
 * Bulk add emails from any pasted text or CSV (extracts every email address automatically)
 */
export const bulkAddWhitelistedEmails = async (
  rawText: string,
  defaultOrderId: string = 'MANUAL-BULK'
): Promise<{ added: number }> => {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
  const matches = rawText.match(emailRegex);
  if (!matches) return { added: 0 };
  
  const uniqueEmails = Array.from(new Set(matches.map((e) => e.trim().toLowerCase())));
  for (const email of uniqueEmails) {
    await addWhitelistedEmail(email, defaultOrderId);
  }
  return { added: uniqueEmails.length };
};

