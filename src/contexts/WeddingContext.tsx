import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  WeddingProject,
  Guest,
  Table,
  Task,
  Vendor,
  BudgetItem,
  FileDoc,
  ActivityLog,
  EmailCampaign,
  EmailTemplate,
} from '../types';
import * as storage from '../utils/storage';
import * as firestoreSync from '../utils/firestoreSync';
import { isFirebaseConfigured } from '../utils/firebase';
import { autoGenerateSeating } from '../utils/seatingAlgorithm';
import { v4 as uuidv4 } from 'uuid';

interface WeddingContextType {
  wedding: WeddingProject;
  guests: Guest[];
  tables: Table[];
  tasks: Task[];
  vendors: Vendor[];
  budgetItems: BudgetItem[];
  files: FileDoc[];
  activities: ActivityLog[];
  emailCampaigns: EmailCampaign[];
  emailTemplates: EmailTemplate[];

  // Actions
  updateWedding: (data: Partial<WeddingProject>) => void;

  // Guest Operations
  addGuest: (guest: Omit<Guest, 'id' | 'updatedAt'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  importGuestsCSV: (newGuests: Omit<Guest, 'id' | 'updatedAt'>[]) => void;
  assignGuestSeat: (guestId: string, tableId?: string, seatNumber?: number) => void;
  sendRSVPReminders: (guestIds: string[]) => void;

  // Table Operations
  addTable: (table: Omit<Table, 'id' | 'assignedGuestIds'>) => void;
  updateTable: (id: string, updates: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  runAutoSeating: () => { seatedCount: number; unassignedCount: number; score: number };

  // Task Operations
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Vendor Operations
  addVendor: (vendor: Omit<Vendor, 'id' | 'communicationLog'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addVendorLog: (vendorId: string, log: { type: 'Email' | 'Call' | 'Meeting'; summary: string }) => void;

  // Budget Operations
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;

  // File Operations
  addFile: (file: Omit<FileDoc, 'id' | 'uploadedAt'>) => void;
  deleteFile: (id: string) => void;

  // Email Campaigns & Templates
  addEmailCampaign: (campaign: Omit<EmailCampaign, 'id'>) => void;
  updateEmailCampaign: (id: string, updates: Partial<EmailCampaign>) => void;
  deleteEmailCampaign: (id: string) => void;
  sendCampaignNow: (campaignId: string) => void;
  addEmailTemplate: (template: Omit<EmailTemplate, 'id'>) => void;
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>) => void;
  deleteEmailTemplate: (id: string) => void;

  // Meal & Dietary Options
  mealOptions: string[];
  dietaryOptions: string[];
  addMealOption: (name: string) => void;
  updateMealOption: (oldName: string, newName: string) => void;
  deleteMealOption: (name: string) => void;
  addDietaryOption: (name: string) => void;
  updateDietaryOption: (oldName: string, newName: string) => void;
  deleteDietaryOption: (name: string) => void;

  // Onboarding & Session
  isOnboarded: boolean;
  completeOnboarding: (data: Partial<WeddingProject>) => void;
  login: (email?: string) => void;
  logout: () => void;
  checkAndLoadRemoteData: (email: string) => Promise<boolean>;

  // Utility
  logActivity: (type: ActivityLog['type'], message: string) => void;
  resetDataToSample: () => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export const WeddingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wedding, setWedding] = useState<WeddingProject>(storage.loadWedding);
  const [guests, setGuests] = useState<Guest[]>(storage.loadGuests);
  const [tables, setTables] = useState<Table[]>(storage.loadTables);
  const [tasks, setTasks] = useState<Task[]>(storage.loadTasks);
  const [vendors, setVendors] = useState<Vendor[]>(storage.loadVendors);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(storage.loadBudgetItems);
  const [files, setFiles] = useState<FileDoc[]>(storage.loadFiles);
  const [activities, setActivities] = useState<ActivityLog[]>(storage.loadActivities);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>(storage.loadEmailCampaigns);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>(storage.loadEmailTemplates);
  const [mealOptions, setMealOptions] = useState<string[]>(storage.loadMealOptions);
  const [dietaryOptions, setDietaryOptions] = useState<string[]>(storage.loadDietaryOptions);

  const checkAndLoadRemoteData = async (email: string): Promise<boolean> => {
    if (!isFirebaseConfigured) return false;
    firestoreSync.setFirestoreEmail(email);
    
    const remoteWedding = await firestoreSync.loadWeddingFromFirestore();
    if (remoteWedding) {
      setWedding(remoteWedding);
      
      const remoteGuests = await firestoreSync.loadCollectionFromFirestore<Guest>('guests');
      if (remoteGuests) setGuests(remoteGuests);

      const remoteTables = await firestoreSync.loadCollectionFromFirestore<Table>('tables');
      if (remoteTables) setTables(remoteTables);

      const remoteTasks = await firestoreSync.loadCollectionFromFirestore<Task>('tasks');
      if (remoteTasks) setTasks(remoteTasks);

      const remoteVendors = await firestoreSync.loadCollectionFromFirestore<Vendor>('vendors');
      if (remoteVendors) setVendors(remoteVendors);

      const remoteBudget = await firestoreSync.loadCollectionFromFirestore<BudgetItem>('budget');
      if (remoteBudget) setBudgetItems(remoteBudget);
      
      // CRITICAL: Only return true if the remote data has COMPLETED onboarding.
      // This prevents new/partially-setup users from skipping onboarding.
      return remoteWedding.onboardingComplete === true;
    }
    return false;
  };

  // Load from Firestore on mount if configured and we have an email
  useEffect(() => {
    if (window.__ADMIN_PREVIEW_MODE__ && window.__ADMIN_PREVIEW_EMAIL__) {
      // Admin is impersonating a user — load their data immediately
      checkAndLoadRemoteData(window.__ADMIN_PREVIEW_EMAIL__).then(hasData => {
        if (!hasData) {
          console.warn('Admin Preview: User has no cloud data or has not completed onboarding.');
        }
      });
    } else if (wedding.email) {
      checkAndLoadRemoteData(wedding.email);
    }
  }, []);

  // Sync state to LocalStorage and Firestore
  useEffect(() => {
    storage.saveWedding(wedding);
    firestoreSync.syncWeddingToFirestore(wedding);
  }, [wedding]);

  useEffect(() => {
    storage.saveGuests(guests);
    firestoreSync.syncCollectionToFirestore('guests', guests);
  }, [guests]);

  useEffect(() => {
    storage.saveTables(tables);
    firestoreSync.syncCollectionToFirestore('tables', tables);
  }, [tables]);

  useEffect(() => {
    storage.saveTasks(tasks);
    firestoreSync.syncCollectionToFirestore('tasks', tasks);
  }, [tasks]);

  useEffect(() => {
    storage.saveVendors(vendors);
    firestoreSync.syncCollectionToFirestore('vendors', vendors);
  }, [vendors]);

  useEffect(() => {
    storage.saveBudgetItems(budgetItems);
    firestoreSync.syncCollectionToFirestore('budget', budgetItems);
  }, [budgetItems]);

  useEffect(() => { storage.saveFiles(files); }, [files]);
  useEffect(() => { storage.saveActivities(activities); }, [activities]);
  useEffect(() => { storage.saveEmailCampaigns(emailCampaigns); }, [emailCampaigns]);
  useEffect(() => { storage.saveEmailTemplates(emailTemplates); }, [emailTemplates]);
  useEffect(() => { storage.saveMealOptions(mealOptions); }, [mealOptions]);
  useEffect(() => { storage.saveDietaryOptions(dietaryOptions); }, [dietaryOptions]);

  const logActivity = (type: ActivityLog['type'], message: string) => {
    const newLog: ActivityLog = {
      id: uuidv4(),
      type,
      message,
      timestamp: 'Just now',
      userEmail: wedding.collaborators[0]?.email || 'admin@wedtrack.com',
      userName: wedding.collaborators[0]?.name || (wedding.partner1Name ? `${wedding.partner1Name} & ${wedding.partner2Name}` : 'WedTrack OS'),
    };
    setActivities((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  const updateWedding = (data: Partial<WeddingProject>) => {
    setWedding((prev) => ({ ...prev, ...data }));
    logActivity('system', 'Updated wedding settings');
  };

  // Guest Actions
  const addGuest = (guestData: Omit<Guest, 'id' | 'updatedAt'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: uuidv4(),
      updatedAt: new Date().toISOString(),
    };
    setGuests((prev) => [...prev, newGuest]);
    logActivity('guest', `Added new guest: ${newGuest.firstName} ${newGuest.lastName}`);
  };

  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g))
    );
  };

  const deleteGuest = (id: string) => {
    const target = guests.find((g) => g.id === id);
    setGuests((prev) => prev.filter((g) => g.id !== id));
    // Remove from tables
    setTables((prev) =>
      prev.map((t) => ({ ...t, assignedGuestIds: t.assignedGuestIds.filter((gId) => gId !== id) }))
    );
    if (target) {
      logActivity('guest', `Removed guest: ${target.firstName} ${target.lastName}`);
    }
  };

  const importGuestsCSV = (newGuestsData: Omit<Guest, 'id' | 'updatedAt'>[]) => {
    const formatted: Guest[] = newGuestsData.map((g) => ({
      ...g,
      id: uuidv4(),
      updatedAt: new Date().toISOString(),
    }));
    setGuests((prev) => [...prev, ...formatted]);
    logActivity('guest', `Imported ${formatted.length} guests via CSV`);
  };

  const assignGuestSeat = (guestId: string, tableId?: string, seatNumber?: number) => {
    setGuests((prev) =>
      prev.map((g) => (g.id === guestId ? { ...g, tableId, seatNumber } : g))
    );

    setTables((prev) =>
      prev.map((t) => {
        const hasGuest = t.assignedGuestIds.includes(guestId);
        if (t.id === tableId && !hasGuest) {
          return { ...t, assignedGuestIds: [...t.assignedGuestIds, guestId] };
        } else if (t.id !== tableId && hasGuest) {
          return { ...t, assignedGuestIds: t.assignedGuestIds.filter((id) => id !== guestId) };
        }
        return t;
      })
    );
  };

  const sendRSVPReminders = (guestIds: string[]) => {
    logActivity('guest', `Sent automated RSVP reminders to ${guestIds.length} guest(s)`);
  };

  // Table Actions
  const addTable = (tableData: Omit<Table, 'id' | 'assignedGuestIds'>) => {
    const newTable: Table = {
      ...tableData,
      id: uuidv4(),
      assignedGuestIds: [],
    };
    setTables((prev) => [...prev, newTable]);
    logActivity('seating', `Added new table: ${newTable.tableName}`);
  };

  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTable = (id: string) => {
    const target = tables.find((t) => t.id === id);
    setTables((prev) => prev.filter((t) => t.id !== id));
    // Unassign guests at this table
    setGuests((prev) =>
      prev.map((g) => (g.tableId === id ? { ...g, tableId: undefined, seatNumber: undefined } : g))
    );
    if (target) logActivity('seating', `Deleted table: ${target.tableName}`);
  };

  const runAutoSeating = () => {
    const result = autoGenerateSeating(guests, tables);
    setTables(result.updatedTables);
    setGuests(result.updatedGuests);
    logActivity('seating', `Auto-generated seating layout (Score: ${result.metrics.satisfactionScore}%)`);
    return {
      seatedCount: result.metrics.seatedGuestsCount,
      unassignedCount: result.unassignedGuests.length,
      score: result.metrics.satisfactionScore,
    };
  };

  // Task Actions
  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = { ...taskData, id: uuidv4() };
    setTasks((prev) => [...prev, newTask]);
    logActivity('task', `Created task: "${newTask.title}"`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteTask = (id: string) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (target) logActivity('task', `Deleted task: "${target.title}"`);
  };

  const toggleTaskComplete = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const isDone = t.status === 'done';
          const newStatus = isDone ? 'todo' : 'done';
          if (!isDone) logActivity('task', `Completed task: "${t.title}"`);
          return {
            ...t,
            status: newStatus,
            completedAt: !isDone ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  };

  // Vendor Actions
  const addVendor = (vendorData: Omit<Vendor, 'id' | 'communicationLog'>) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: uuidv4(),
      communicationLog: [],
    };
    setVendors((prev) => [...prev, newVendor]);
    
    // Auto-create linked budget item
    const newBudgetItem: BudgetItem = {
      id: uuidv4(),
      category: vendorData.category,
      description: vendorData.name,
      vendorId: newVendor.id,
      allocatedAmount: vendorData.quotedCost || 0,
      actualAmount: vendorData.actualCost || 0,
      paidAmount: vendorData.depositAmount || 0,
    };
    setBudgetItems((prev) => [...prev, newBudgetItem]);

    logActivity('vendor', `Added vendor: ${newVendor.name} (${newVendor.category})`);
  };

  const updateVendor = (id: string, updates: Partial<Vendor>) => {
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updates } : v)));
    
    // Auto-update linked budget item
    if (updates.name !== undefined || updates.category !== undefined || updates.quotedCost !== undefined || updates.actualCost !== undefined || updates.depositAmount !== undefined) {
      setBudgetItems((prev) => prev.map((b) => {
        if (b.vendorId === id) {
          return {
            ...b,
            description: updates.name !== undefined ? updates.name : b.description,
            category: updates.category !== undefined ? updates.category : b.category,
            allocatedAmount: updates.quotedCost !== undefined ? updates.quotedCost : b.allocatedAmount,
            actualAmount: updates.actualCost !== undefined ? updates.actualCost : b.actualAmount,
            paidAmount: updates.depositAmount !== undefined ? updates.depositAmount : b.paidAmount,
          };
        }
        return b;
      }));
    }
  };

  const deleteVendor = (id: string) => {
    const target = vendors.find((v) => v.id === id);
    setVendors((prev) => prev.filter((v) => v.id !== id));
    
    // Delete linked budget item
    setBudgetItems((prev) => prev.filter((b) => b.vendorId !== id));

    if (target) logActivity('vendor', `Removed vendor: ${target.name}`);
  };

  const addVendorLog = (
    vendorId: string,
    logData: { type: 'Email' | 'Call' | 'Meeting'; summary: string }
  ) => {
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === vendorId) {
          const newLog = {
            id: uuidv4(),
            date: new Date().toISOString().split('T')[0],
            ...logData,
            authorName: wedding.collaborators[0]?.name || (wedding.partner1Name ? `${wedding.partner1Name} & ${wedding.partner2Name}` : 'WedTrack OS'),
          };
          return { ...v, communicationLog: [newLog, ...v.communicationLog] };
        }
        return v;
      })
    );
  };

  // Budget Actions
  const addBudgetItem = (itemData: Omit<BudgetItem, 'id'>) => {
    const newItem: BudgetItem = { ...itemData, id: uuidv4() };
    setBudgetItems((prev) => [...prev, newItem]);
    logActivity('budget', `Added budget item: "${newItem.description}"`);
  };

  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    setBudgetItems((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBudgetItem = (id: string) => {
    setBudgetItems((prev) => prev.filter((b) => b.id !== id));
  };

  // File Actions
  const addFile = (fileData: Omit<FileDoc, 'id' | 'uploadedAt'>) => {
    const newFile: FileDoc = {
      ...fileData,
      id: uuidv4(),
      uploadedAt: new Date().toISOString(),
    };
    setFiles((prev) => [newFile, ...prev]);
    logActivity('file', `Uploaded file: ${newFile.name}`);
  };

  const deleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Email Campaigns
  const addEmailCampaign = (campData: Omit<EmailCampaign, 'id'>) => {
    const newCamp: EmailCampaign = { ...campData, id: uuidv4() };
    setEmailCampaigns((prev) => [...prev, newCamp]);
    logActivity('system', `Created new email campaign: ${newCamp.title}`);
  };

  const updateEmailCampaign = (id: string, updates: Partial<EmailCampaign>) => {
    setEmailCampaigns((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteEmailCampaign = (id: string) => {
    setEmailCampaigns((prev) => prev.filter((c) => c.id !== id));
    logActivity('system', 'Deleted email campaign');
  };

  const sendCampaignNow = (campaignId: string) => {
    setEmailCampaigns((prev) =>
      prev.map((c) => {
        if (c.id !== campaignId) return c;
        let count = guests.length;
        if (c.recipientFilter === 'custom' && c.customGuestIds) count = c.customGuestIds.length;
        else if (c.recipientFilter === 'confirmed') count = guests.filter((g) => g.rsvpStatus === 'confirmed').length;
        else if (c.recipientFilter === 'unconfirmed') count = guests.filter((g) => g.rsvpStatus !== 'confirmed' && g.rsvpStatus !== 'declined').length;
        else if (c.recipientFilter === 'declined') count = guests.filter((g) => g.rsvpStatus === 'declined').length;
        return { ...c, status: 'sent', sentCount: count, openRate: 88, clickRate: 72 };
      })
    );
    logActivity('system', 'Dispatched automated email campaign blast');
  };

  // Email Templates
  const addEmailTemplate = (tmplData: Omit<EmailTemplate, 'id'>) => {
    const newTmpl: EmailTemplate = { ...tmplData, id: uuidv4() };
    setEmailTemplates((prev) => [...prev, newTmpl]);
    logActivity('system', `Created custom email template: ${newTmpl.name}`);
  };

  const updateEmailTemplate = (id: string, updates: Partial<EmailTemplate>) => {
    setEmailTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const deleteEmailTemplate = (id: string) => {
    setEmailTemplates((prev) => prev.filter((t) => t.id !== id));
    logActivity('system', 'Deleted email template');
  };

  // Meal & Dietary Options
  const addMealOption = (name: string) => {
    if (!name.trim() || mealOptions.includes(name.trim())) return;
    setMealOptions((prev) => [...prev, name.trim()]);
    logActivity('system', `Added meal option: ${name.trim()}`);
  };

  const updateMealOption = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    setMealOptions((prev) => prev.map((m) => (m === oldName ? newName.trim() : m)));
    setGuests((prev) =>
      prev.map((g) => (g.mealPreference === oldName ? { ...g, mealPreference: newName.trim() as any } : g))
    );
  };

  const deleteMealOption = (name: string) => {
    setMealOptions((prev) => prev.filter((m) => m !== name));
    logActivity('system', `Removed meal option: ${name}`);
  };

  const addDietaryOption = (name: string) => {
    if (!name.trim() || dietaryOptions.includes(name.trim())) return;
    setDietaryOptions((prev) => [...prev, name.trim()]);
    logActivity('system', `Added dietary tag: ${name.trim()}`);
  };

  const updateDietaryOption = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    setDietaryOptions((prev) => prev.map((d) => (d === oldName ? newName.trim() : d)));
    setGuests((prev) =>
      prev.map((g) => ({
        ...g,
        dietaryRestrictions: g.dietaryRestrictions.map((d) => (d === oldName ? newName.trim() : d)),
      }))
    );
  };

  const deleteDietaryOption = (name: string) => {
    setDietaryOptions((prev) => prev.filter((d) => d !== name));
    logActivity('system', `Removed dietary tag: ${name}`);
  };

  const resetDataToSample = () => {
    storage.resetAllDataToSample();
    setWedding(storage.loadWedding());
    setGuests(storage.loadGuests());
    setTables(storage.loadTables());
    setTasks(storage.loadTasks());
    setVendors(storage.loadVendors());
    setBudgetItems(storage.loadBudgetItems());
    setFiles(storage.loadFiles());
    setActivities(storage.loadActivities());
    setEmailCampaigns(storage.loadEmailCampaigns());
    setEmailTemplates(storage.loadEmailTemplates());
    setMealOptions(storage.loadMealOptions());
    setDietaryOptions(storage.loadDietaryOptions());
  };

  const isOnboarded = wedding.onboardingComplete === true;

  const completeOnboarding = (data: Partial<WeddingProject>) => {
    setWedding((prev) => {
      const updated = {
        ...prev,
        ...data,
        onboardingComplete: true,
      };
      logActivity('system', `Wedding project created for ${updated.partner1Name} & ${updated.partner2Name}!`);
      return updated;
    });
  };

  const login = (email?: string) => {
    setWedding((prev) => {
      const updated = {
        ...prev,
        email: email || prev.email || 'realdevog@gmail.com',
        onboardingComplete: true,
      };
      return updated;
    });
    logActivity('system', 'User logged back into session.');
  };

  const logout = () => {
    // 1. Disconnect Firebase sync BEFORE resetting local state so we don't wipe cloud data
    if (isFirebaseConfigured) {
      firestoreSync.setFirestoreEmail('');
    }
    
    // 2. Clear all local storage to guarantee a fresh state for the next user
    storage.resetAllDataToSample();

    // 3. Force a clean reload so all React contexts and states are completely flushed
    window.location.reload();
  };

  return (
    <WeddingContext.Provider
      value={{
        wedding,
        guests,
        tables,
        tasks,
        vendors,
        budgetItems,
        files,
        activities,
        emailCampaigns,
        emailTemplates,
        updateWedding,
        addGuest,
        updateGuest,
        deleteGuest,
        importGuestsCSV,
        assignGuestSeat,
        sendRSVPReminders,
        addTable,
        updateTable,
        deleteTable,
        runAutoSeating,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskComplete,
        addVendor,
        updateVendor,
        deleteVendor,
        addVendorLog,
        addBudgetItem,
        updateBudgetItem,
        deleteBudgetItem,
        addFile,
        deleteFile,
        addEmailCampaign,
        updateEmailCampaign,
        deleteEmailCampaign,
        sendCampaignNow,
        addEmailTemplate,
        updateEmailTemplate,
        deleteEmailTemplate,
        mealOptions,
        dietaryOptions,
        addMealOption,
        updateMealOption,
        deleteMealOption,
        addDietaryOption,
        updateDietaryOption,
        deleteDietaryOption,
        logActivity,
        resetDataToSample,
        isOnboarded,
        completeOnboarding,
        login,
        logout,
        checkAndLoadRemoteData,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
};

export const useWedding = () => {
  const context = useContext(WeddingContext);
  if (!context) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
};
