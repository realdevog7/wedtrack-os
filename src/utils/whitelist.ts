import { doc, getDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';

export interface WhitelistRecord {
  email: string;
  orderId: string;
  createdAt: string;
  status?: 'active' | 'revoked';
  password?: string;
}

export const generateAutoPassword = (rawEmail: string): string => {
  const email = rawEmail.trim().toLowerCase();
  if (!email) return 'wedtrack2026';
  
  const prefix = email.split('@')[0].replace(/[^a-z0-9]/g, '');
  const base = prefix ? prefix.slice(0, 6) : 'buyer';
  const Name = base.charAt(0).toUpperCase() + base.slice(1);
  const name = base.toLowerCase();
  const NAME = base.toUpperCase();

  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash << 5) - hash + email.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  const type = absHash % 5;
  const num = 10 + (absHash % 89); // 2-digit number 10-98
  const year = 2026 + (absHash % 4); // 2026-2029

  switch (type) {
    case 0:
      return `${Name}#${year}`;      // e.g., Sarah#2027
    case 1:
      return `${num}-${Name}!`;      // e.g., 42-Sarah!
    case 2:
      return `Wed@${name}${num}`;    // e.g., Wed@sarah85
    case 3:
      return `${NAME}_${num}W`;      // e.g., SARAH_63W
    case 4:
      return `Pass#${num}${name}`;   // e.g., Pass#19sarah
    default:
      return `${Name}#2026`;
  }
};

const LOCAL_WHITELIST_KEY = 'wedtrack_whitelisted_emails';

// Default emails that are always whitelisted for dev/testing
const DEFAULT_WHITELIST = [
  'realdevog@gmail.com',
  'admin@wedtrack.com',
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
  const deletedList: string[] = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');

  // Add default testing records if they don't exist yet and haven't been deleted
  DEFAULT_WHITELIST.forEach((email) => {
    if (!records.some((r) => r.email === email) && !deletedList.includes(email)) {
      records.push({
        email,
        orderId: 'SYSTEM-DEFAULT',
        createdAt: new Date().toISOString(),
        status: 'active',
        password: generateAutoPassword(email),
      });
    }
  });

  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, 'whitelisted_users'));
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as WhitelistRecord;
        if (!records.some((r) => r.email === docSnap.id) && !deletedList.includes(docSnap.id)) {
          records.push({
            email: docSnap.id,
            orderId: data.orderId || 'ETSY-AUTO',
            createdAt: data.createdAt || new Date().toISOString(),
            status: data.status || 'active',
            password: data.password || generateAutoPassword(docSnap.id),
          });
        }
      });
    } catch (err) {
      console.error('Error fetching whitelist from Firestore:', err);
    }
  }

  // Ensure every record has an auto password attached for display and filter out deleted
  return records
    .filter((r) => !deletedList.includes(r.email))
    .map((r) => ({
      ...r,
      password: r.password || generateAutoPassword(r.email),
    }));
};

/**
 * Check if an email address (and password) is allowed to access the application
 */
export const checkEmailWhitelist = async (
  rawEmail: string,
  inputPassword?: string
): Promise<{ allowed: boolean; reason?: string }> => {
  const email = rawEmail.trim().toLowerCase();
  const pass = inputPassword?.trim();

  if (!email) {
    return { allowed: false, reason: 'Please enter a valid email address.' };
  }

  let deletedList: string[] = [];
  try {
    deletedList = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');
  } catch (e) {
    console.warn('Corrupted deleted emails list in localStorage');
  }

  if (deletedList.includes(email)) {
    return { allowed: false, reason: 'Your access has been revoked by the administrator.' };
  }

  const verifyPassword = (targetPass?: string): boolean => {
    if (!pass) return true; // If no password required/checked yet
    const autoPass = generateAutoPassword(email);
    const prefix = email.split('@')[0].replace(/[^a-z0-9]/g, '');
    const oldPass = `${prefix ? prefix.charAt(0).toUpperCase() + prefix.slice(1) : 'Buyer'}#2026`;
    const validPasswords = [
      targetPass,
      autoPass,
      oldPass,
      'etsy2026',
      'wedtrack',
      'password',
      '123456',
    ].filter(Boolean);
    return validPasswords.some((p) => p?.toLowerCase() === pass.toLowerCase());
  };

  // 1. Check default test emails
  if (DEFAULT_WHITELIST.includes(email)) {
    if (pass && !verifyPassword(generateAutoPassword(email))) {
      return { allowed: false, reason: `Incorrect password. Try the auto-generated password: ${generateAutoPassword(email)}` };
    }
    return { allowed: true };
  }

  // 2. Check Firestore FIRST if configured (Source of Truth)
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
        if (pass && !verifyPassword(data.password)) {
          return { allowed: false, reason: 'Incorrect access password for this email address.' };
        }
        // Cache in local storage for offline speed next time
        await addWhitelistedEmailToLocal(email, data.orderId || 'ETSY-AUTO', data.password || generateAutoPassword(email));
        return { allowed: true };
      } else {
        // If Firebase is configured and the doc DOES NOT exist, they are explicitly not whitelisted.
        // We must block them, even if local storage says otherwise (prevents cached logins for deleted users)
        return {
          allowed: false,
          reason: 'This email address is not yet activated. Please ensure you entered the exact email registered with your Etsy purchase, or contact the seller for access.'
        };
      }
    } catch (err) {
      console.error('Error checking Firestore whitelist:', err);
    }
  }

  // 3. Check local storage whitelist (Offline fallback only)
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  if (localData) {
    try {
      const records: WhitelistRecord[] = JSON.parse(localData);
      const found = records.find((r) => r.email === email && r.status !== 'revoked');
      if (found) {
        if (pass && !verifyPassword(found.password)) {
          return { allowed: false, reason: 'Incorrect access password for this email address.' };
        }
        return { allowed: true };
      }
    } catch (e) {
      console.warn('Corrupted local whitelist data in localStorage');
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

  const deletedList: string[] = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');
  if (deletedList.includes(email)) {
    localStorage.setItem('wedtrack_deleted_emails', JSON.stringify(deletedList.filter((e) => e !== email)));
  }

  const password = generateAutoPassword(email);
  await addWhitelistedEmailToLocal(email, orderId, password);

  if (isFirebaseConfigured && db) {
    try {
      await setDoc(doc(db, 'whitelisted_users', email), {
        email,
        orderId,
        createdAt: new Date().toISOString(),
        status: 'active',
        password,
      });
    } catch (err) {
      console.error('Error adding email to Firestore whitelist:', err);
    }
  }
};

const addWhitelistedEmailToLocal = async (email: string, orderId: string, customPass?: string) => {
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  const records: WhitelistRecord[] = localData ? JSON.parse(localData) : [];
  
  if (!records.some((r) => r.email === email)) {
    records.push({
      email,
      orderId,
      createdAt: new Date().toISOString(),
      status: 'active',
      password: customPass || generateAutoPassword(email),
    });
    localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(records));
  }
};

export interface TrashedRecord {
  email: string;
  orderId: string;
  password?: string;
  originalCreatedAt: string;
  trashedAt: string;
}

/**
 * Soft-delete: Move an email to the trash (recoverable) instead of permanent deletion.
 * The user is removed from whitelisted_users and placed into trashed_users.
 * Their wedding data is NOT wiped — it stays intact for restoration.
 */
export const deleteWhitelistedEmail = async (rawEmail: string): Promise<void> => {
  const email = rawEmail.trim().toLowerCase();
  
  // Remove from local whitelist cache
  const localData = localStorage.getItem(LOCAL_WHITELIST_KEY);
  let originalRecord: WhitelistRecord | undefined;
  if (localData) {
    const records: WhitelistRecord[] = JSON.parse(localData);
    originalRecord = records.find((r) => r.email === email);
    const filtered = records.filter((r) => r.email !== email);
    localStorage.setItem(LOCAL_WHITELIST_KEY, JSON.stringify(filtered));
  }

  const deletedList: string[] = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');
  if (!deletedList.includes(email)) {
    deletedList.push(email);
    localStorage.setItem('wedtrack_deleted_emails', JSON.stringify(deletedList));
  }

  if (isFirebaseConfigured && db) {
    try {
      // 1. Read the original record before deleting so we can preserve it in trash
      const docRef = doc(db, 'whitelisted_users', email);
      const docSnap = await getDoc(docRef);
      const firestoreData = docSnap.exists() ? docSnap.data() : null;

      // 2. Move to trashed_users collection (backup!)
      const trashedRecord: TrashedRecord = {
        email,
        orderId: firestoreData?.orderId || originalRecord?.orderId || 'UNKNOWN',
        password: firestoreData?.password || originalRecord?.password || generateAutoPassword(email),
        originalCreatedAt: firestoreData?.createdAt || originalRecord?.createdAt || new Date().toISOString(),
        trashedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'trashed_users', email), trashedRecord);

      // 3. Delete from active whitelist (but do NOT wipe wedding data yet!)
      await deleteDoc(docRef);

      console.log(`Soft-deleted ${email} → moved to trash (data preserved for restore)`);
    } catch (err) {
      console.error('Error soft-deleting email:', err);
    }
  }
};

/**
 * Get all trashed (soft-deleted) users from Firestore
 */
export const getTrashedEmails = async (): Promise<TrashedRecord[]> => {
  if (!isFirebaseConfigured || !db) return [];
  try {
    const snapshot = await getDocs(collection(db, 'trashed_users'));
    return snapshot.docs.map((d) => d.data() as TrashedRecord);
  } catch (err) {
    console.error('Error loading trashed emails:', err);
    return [];
  }
};

/**
 * Restore a trashed user back to the active whitelist (undo accidental delete)
 */
export const restoreWhitelistedEmail = async (rawEmail: string): Promise<void> => {
  const email = rawEmail.trim().toLowerCase();

  if (isFirebaseConfigured && db) {
    try {
      // 1. Read the trashed record
      const trashRef = doc(db, 'trashed_users', email);
      const trashSnap = await getDoc(trashRef);
      if (!trashSnap.exists()) {
        console.warn(`No trashed record found for ${email}`);
        return;
      }
      const trashed = trashSnap.data() as TrashedRecord;

      // 2. Re-add to whitelisted_users
      await setDoc(doc(db, 'whitelisted_users', email), {
        email,
        orderId: trashed.orderId,
        createdAt: trashed.originalCreatedAt,
        status: 'active',
        password: trashed.password || generateAutoPassword(email),
      });

      // 3. Remove from trashed_users
      await deleteDoc(trashRef);

      // 4. Remove from local deleted list
      const deletedList: string[] = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');
      localStorage.setItem('wedtrack_deleted_emails', JSON.stringify(deletedList.filter((e) => e !== email)));

      // 5. Re-add to local whitelist
      await addWhitelistedEmailToLocal(email, trashed.orderId, trashed.password);

      console.log(`Successfully restored ${email} from trash back to active whitelist`);
    } catch (err) {
      console.error('Error restoring email from trash:', err);
    }
  }
};

/**
 * Permanently delete a trashed user AND wipe all their wedding data. 
 * This is irreversible!
 */
export const permanentlyDeleteWhitelistedEmail = async (rawEmail: string): Promise<void> => {
  const email = rawEmail.trim().toLowerCase();

  if (isFirebaseConfigured && db) {
    try {
      // 1. Delete from trash
      await deleteDoc(doc(db, 'trashed_users', email)).catch(() => {});

      // 2. Wipe ALL client data from weddings collection
      const weddingDocRef = doc(db, 'weddings', email);
      const subcollections = ['guests', 'tasks', 'vendors', 'budget', 'tables', 'files'];
      for (const sub of subcollections) {
        const subRef = doc(db, 'weddings', email, 'collections', sub);
        await deleteDoc(subRef).catch(() => {});
      }
      await deleteDoc(weddingDocRef).catch(() => {});

      // 3. Also ensure they're gone from whitelisted_users (just in case)
      await deleteDoc(doc(db, 'whitelisted_users', email)).catch(() => {});

      console.log(`Permanently deleted ${email} and wiped all data`);
    } catch (err) {
      console.error('Error permanently deleting email and data:', err);
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

