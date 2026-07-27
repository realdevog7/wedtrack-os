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

  // 2. Check local storage whitelist
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
        if (pass && !verifyPassword(data.password)) {
          return { allowed: false, reason: 'Incorrect access password for this email address.' };
        }
        // Cache in local storage for offline speed next time
        await addWhitelistedEmailToLocal(email, data.orderId || 'ETSY-AUTO', data.password || generateAutoPassword(email));
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

  const deletedList: string[] = JSON.parse(localStorage.getItem('wedtrack_deleted_emails') || '[]');
  if (!deletedList.includes(email)) {
    deletedList.push(email);
    localStorage.setItem('wedtrack_deleted_emails', JSON.stringify(deletedList));
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

