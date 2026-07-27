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
import {
  INITIAL_WEDDING,
  INITIAL_GUESTS,
  INITIAL_TABLES,
  INITIAL_TASKS,
  INITIAL_VENDORS,
  INITIAL_BUDGET_ITEMS,
  INITIAL_FILES,
  INITIAL_ACTIVITIES,
  INITIAL_EMAIL_CAMPAIGNS,
  INITIAL_EMAIL_TEMPLATES,
} from './sampleData';

const KEYS = {
  WEDDING: 'wp_wedding_data',
  GUESTS: 'wp_guests',
  TABLES: 'wp_tables',
  TASKS: 'wp_tasks',
  VENDORS: 'wp_vendors',
  BUDGET: 'wp_budget_items',
  FILES: 'wp_files',
  ACTIVITIES: 'wp_activities',
  CAMPAIGNS: 'wp_email_campaigns',
  TEMPLATES: 'wp_email_templates',
  MEALS: 'wp_meal_options',
  DIETARY: 'wp_dietary_options',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error:', err);
  }
}

export function loadWedding(): WeddingProject {
  return getItem(KEYS.WEDDING, INITIAL_WEDDING);
}

export function saveWedding(data: WeddingProject): void {
  setItem(KEYS.WEDDING, data);
}

export function loadGuests(): Guest[] {
  return getItem(KEYS.GUESTS, INITIAL_GUESTS);
}

export function saveGuests(guests: Guest[]): void {
  setItem(KEYS.GUESTS, guests);
}

export function loadTables(): Table[] {
  return getItem(KEYS.TABLES, INITIAL_TABLES);
}

export function saveTables(tables: Table[]): void {
  setItem(KEYS.TABLES, tables);
}

export function loadTasks(): Task[] {
  return getItem(KEYS.TASKS, INITIAL_TASKS);
}

export function saveTasks(tasks: Task[]): void {
  setItem(KEYS.TASKS, tasks);
}

export function loadVendors(): Vendor[] {
  return getItem(KEYS.VENDORS, INITIAL_VENDORS);
}

export function saveVendors(vendors: Vendor[]): void {
  setItem(KEYS.VENDORS, vendors);
}

export function loadBudgetItems(): BudgetItem[] {
  return getItem(KEYS.BUDGET, INITIAL_BUDGET_ITEMS);
}

export function saveBudgetItems(items: BudgetItem[]): void {
  setItem(KEYS.BUDGET, items);
}

export function loadFiles(): FileDoc[] {
  return getItem(KEYS.FILES, INITIAL_FILES);
}

export function saveFiles(files: FileDoc[]): void {
  setItem(KEYS.FILES, files);
}

export function loadActivities(): ActivityLog[] {
  return getItem(KEYS.ACTIVITIES, INITIAL_ACTIVITIES);
}

export function saveActivities(logs: ActivityLog[]): void {
  setItem(KEYS.ACTIVITIES, logs);
}

export function loadEmailCampaigns(): EmailCampaign[] {
  return getItem(KEYS.CAMPAIGNS, INITIAL_EMAIL_CAMPAIGNS);
}

export function saveEmailCampaigns(campaigns: EmailCampaign[]): void {
  setItem(KEYS.CAMPAIGNS, campaigns);
}

export function loadEmailTemplates(): EmailTemplate[] {
  const templates = getItem(KEYS.TEMPLATES, INITIAL_EMAIL_TEMPLATES);
  return templates.map((t) => {
    if (t.name === 'RSVP Reminder' && !t.body.includes('{{rsvpLink}}') && !t.body.includes('{{rsvp_link}}')) {
      return {
        ...t,
        body: t.body.replace(
          'Please let us know if you will be able to join us.',
          'Please let us know if you will be able to join us by updating your RSVP here:\n{{rsvpLink}}'
        ),
      };
    }
    return t;
  });
}

export function saveEmailTemplates(templates: EmailTemplate[]): void {
  setItem(KEYS.TEMPLATES, templates);
}

const DEFAULT_MEALS = [
  'Standard (Beef)',
  'Chicken',
  'Fish',
  'Vegetarian',
  'Vegan',
  'Kids Meal',
];

const DEFAULT_DIETARY = [
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Shellfish Allergy',
  'Halal',
  'Kosher',
  'Diabetic',
  'Low Sodium',
];

export function loadMealOptions(): string[] {
  return getItem(KEYS.MEALS, DEFAULT_MEALS);
}

export function saveMealOptions(meals: string[]): void {
  setItem(KEYS.MEALS, meals);
}

export function loadDietaryOptions(): string[] {
  return getItem(KEYS.DIETARY, DEFAULT_DIETARY);
}

export function saveDietaryOptions(dietary: string[]): void {
  setItem(KEYS.DIETARY, dietary);
}

export function resetAllDataToSample(): void {
  localStorage.setItem(KEYS.WEDDING, JSON.stringify(INITIAL_WEDDING));
  localStorage.setItem(KEYS.GUESTS, JSON.stringify(INITIAL_GUESTS));
  localStorage.setItem(KEYS.TABLES, JSON.stringify(INITIAL_TABLES));
  localStorage.setItem(KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
  localStorage.setItem(KEYS.VENDORS, JSON.stringify(INITIAL_VENDORS));
  localStorage.setItem(KEYS.BUDGET, JSON.stringify(INITIAL_BUDGET_ITEMS));
  localStorage.setItem(KEYS.FILES, JSON.stringify(INITIAL_FILES));
  localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(INITIAL_ACTIVITIES));
  localStorage.setItem(KEYS.CAMPAIGNS, JSON.stringify(INITIAL_EMAIL_CAMPAIGNS));
  localStorage.setItem(KEYS.TEMPLATES, JSON.stringify(INITIAL_EMAIL_TEMPLATES));
  localStorage.setItem(KEYS.MEALS, JSON.stringify(DEFAULT_MEALS));
  localStorage.setItem(KEYS.DIETARY, JSON.stringify(DEFAULT_DIETARY));
}
