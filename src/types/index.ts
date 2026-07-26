export type RSVPStatus = 'invited' | 'opened' | 'responded' | 'confirmed' | 'declined';

export type GuestGroup = 'Family Partner 1' | 'Family Partner 2' | 'Friends' | 'Work' | 'VIP' | 'Other';

export type AgeGroup = 'Adult' | 'Child' | 'Infant';

export type Gender = 'Male' | 'Female' | 'Non-binary' | 'Prefer not to say';

export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rsvpStatus: RSVPStatus;
  dietaryRestrictions: string[];
  allergies?: string;
  mealPreference: 'Standard (Beef)' | 'Chicken' | 'Fish' | 'Vegetarian' | 'Vegan' | 'Kids Meal' | 'Custom';
  hasPlusOne: boolean;
  plusOneName?: string;
  plusOneRsvp?: 'confirmed' | 'declined';
  plusOneMeal?: string;
  tableId?: string;
  seatNumber?: number;
  groupCategory: GuestGroup;
  ageGroup: AgeGroup;
  gender?: Gender;
  conflictGuestIds?: string[]; // IDs of guests to keep away
  mustSitWithGuestIds?: string[]; // IDs of guests to keep together
  notes?: string;
  updatedAt: string;
}

export type TableShape = 'round' | 'rectangular' | 'long';

export interface Table {
  id: string;
  tableName: string;
  shape: TableShape;
  maxSeats: number;
  xPosition: number;
  yPosition: number;
  assignedGuestIds: string[];
}

export type TaskCategory =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Flowers'
  | 'Music'
  | 'Attire'
  | 'Ceremony'
  | 'Decor'
  | 'Logistics'
  | 'Invitations'
  | 'Other'
  | (string & {});

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dueDate: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedToUserUid?: string;
  dependencyTaskIds?: string[];
  completedAt?: string;
}

export type VendorCategory =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Videography'
  | 'Flowers'
  | 'Music/DJ'
  | 'Attire'
  | 'Rentals'
  | 'Cake'
  | 'Hair & Makeup'
  | 'Other'
  | (string & {});

export type VendorStatus = 'Inquiry' | 'Contacted' | 'Quoted' | 'Confirmed' | 'Cancelled';
export type PaymentStatus = 'Not paid' | 'Deposit paid' | 'Fully paid';

export interface CommunicationLog {
  id: string;
  date: string;
  type: 'Email' | 'Call' | 'Meeting';
  summary: string;
  authorName: string;
}

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson: string;
  phone: string;
  email: string;
  website: string;
  status: VendorStatus;
  quotedCost: number;
  actualCost: number;
  paymentStatus: PaymentStatus;
  depositAmount: number;
  depositPaidDate?: string;
  finalPaidDate?: string;
  rating?: number;
  review?: string;
  communicationLog: CommunicationLog[];
  contractUrl?: string;
  notes?: string;
}

export interface BudgetItem {
  id: string;
  category: VendorCategory | 'General';
  description: string;
  vendorId?: string;
  allocatedAmount: number;
  actualAmount: number;
  paidAmount: number;
  notes?: string;
}

export interface BudgetCategorySummary {
  category: string;
  allocated: number;
  spent: number;
  paid: number;
  remaining: number;
  itemCount: number;
}

export interface FileDoc {
  id: string;
  name: string;
  category: 'Contract' | 'Invoice' | 'Inspiration' | 'Guest Data' | 'General' | (string & {});
  sizeBytes: number;
  type: string;
  url: string;
  vendorId?: string;
  uploadedAt: string;
}

export interface ActivityLog {
  id: string;
  type: 'guest' | 'task' | 'vendor' | 'budget' | 'seating' | 'file' | 'system';
  message: string;
  timestamp: string;
  userEmail: string;
  userName: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export interface EmailCampaign {
  id: string;
  title: string;
  scheduledDate: string;
  status: 'draft' | 'scheduled' | 'sent';
  recipientFilter: 'all' | 'unconfirmed' | 'confirmed' | 'declined' | 'custom';
  customGuestIds?: string[];
  sentCount: number;
  openRate: number;
  clickRate: number;
}

export type UserRole = 'Owner' | 'Editor' | 'Viewer';

export interface Collaborator {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  isOnline?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    emailNotifications: boolean;
    reminderFrequency: 'daily' | 'weekly' | 'immediate';
  };
}

export type WeddingType = 'Traditional' | 'Destination' | 'Intimate/Elopement' | 'Cultural' | 'Garden Party' | 'Black Tie Gala';
export type WeddingStyle = 'Romantic' | 'Modern Minimalist' | 'Rustic Chic' | 'Bohemian' | 'Classic Elegance' | 'Glamorous' | 'Vintage';
export type VenueType = 'indoor' | 'outdoor' | 'both';
export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type BudgetFlexibility = 'strict' | 'moderate' | 'flexible';

export interface WeddingProject {
  id: string;
  partner1Name: string;
  partner2Name: string;
  email?: string;
  weddingDate: string;
  venueName: string;
  venueAddress: string;
  totalBudget: number;
  currency: string;
  collaborators: Collaborator[];
  publicShareSlug?: string;
  isPasswordProtected?: boolean;
  sharePassword?: string;

  // Onboarding metadata
  weddingType?: WeddingType;
  weddingStyle?: WeddingStyle;
  venueType?: VenueType;
  season?: Season;
  estimatedGuests?: number;
  budgetPriorities?: string[];
  budgetFlexibility?: BudgetFlexibility;
  onboardingComplete?: boolean;
}
