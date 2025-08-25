export interface Project {
  projectId: string;
  title: string;
  description: string;
  amount: number;
  statusId: string;
  contractorId: string;
  locationId: string;
  progress: string;
  expectedOurcome: string;
  reason: string;
  startDate: Date;
  expectedCompletionDate: Date;
  createdAt: Date;
}

// Extended interface for displaying projects with related data
export interface ProjectWithDetails extends Project {
  id: string; // Alias for projectId for easier use
  status: string; // Status name from Status table
  contractor: string; // Contractor name from Contractor table
  location: string; // Location string (city, region)
  expectedOutcome: string; // Fixed typo from expectedOurcome
  personnel: string; // Personnel information
  likes: number; // From fact tables
  dislikes: number; // From fact tables
  comments: number; // From fact tables
  image?: string; // Primary image URL
  images?: string[]; // Array of image URLs
  milestones?: Array<{
    title: string;
    date: Date;
    completed: boolean;
  }>;
  // Computed/display properties
  amountFormatted?: string; // Formatted amount for display
  progressNumber?: number; // Progress as number for calculations
}