import { WeddingProject, Guest, Table, Task, Vendor, BudgetItem, FileDoc, ActivityLog, EmailCampaign, EmailTemplate } from '../types';

export const INITIAL_WEDDING: WeddingProject = {
  id: 'new-wedding-project',
  partner1Name: '',
  partner2Name: '',
  weddingDate: new Date().toISOString(),
  venueName: '',
  venueAddress: '',
  totalBudget: 0,
  currency: '$',
  collaborators: [],
  onboardingComplete: false,
};

export const INITIAL_GUESTS: Guest[] = [];
export const INITIAL_TABLES: Table[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_VENDORS: Vendor[] = [];
export const INITIAL_BUDGET_ITEMS: BudgetItem[] = [];
export const INITIAL_FILES: FileDoc[] = [];
export const INITIAL_ACTIVITIES: ActivityLog[] = [];
export const INITIAL_EMAIL_CAMPAIGNS: EmailCampaign[] = [];

export const INITIAL_EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'tpl-1',
    name: 'Save the Date',
    subject: 'Save the Date: {{partner1Name}} & {{partner2Name}} are getting married!',
    body: 'Dear {{guestName}},\n\nPlease save the date for our wedding on {{weddingDate}} at {{venueName}}.\n\nFormal invitation to follow.\n\nLove,\n{{partner1Name}} & {{partner2Name}}',
  },
  {
    id: 'tpl-2',
    name: 'RSVP Reminder',
    subject: 'Action Required: RSVP for {{partner1Name}} & {{partner2Name}}\'s Wedding',
    body: 'Dear {{guestName}},\n\nWe hope this email finds you well! This is a friendly reminder that the RSVP deadline for our wedding is approaching.\n\nPlease let us know if you will be able to join us by updating your RSVP here:\n{{rsvpLink}}\n\nBest,\n{{partner1Name}} & {{partner2Name}}',
  }
];
