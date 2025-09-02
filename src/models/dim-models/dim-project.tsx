export interface Project {
  project_id: string;
  title: string;
  description: string;
  amount: number;
  start_date: Date;
  end_date: Date;
  status_id: string;
  location_id: string;
  contractor_id: string;
  progress: number;
  expected_outcome: string;
  reason: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

// Personnel information interface
export interface ProjectPersonnel {
  personnel_id: string;
  user_id: string;
  username: string;
}

// Extended interface for displaying projects with related data
export interface ProjectWithDetails extends Project {
  project_id: string;
  title: string;
  description: string;
  amount: number;
  start_date: Date;
  end_date: Date;
  status: string;
  location: string;
  contractor: string;
  progress: number;
  expected_outcome: string;
  reason: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
  personnel: string; // Personnel information
  personnel_list?: ProjectPersonnel[]; // Structured personnel data
  likes: number; // From fact tables
  dislikes: number; // From fact tables
  comments: number; // From fact tables
  image?: string; // Primary image URL
  images: import("@/models/fact-models/fact-project-images").FactProjectImages[]; // Array of image objects
  milestones?: Array<{
    title: string;
    date: Date;
    completed: boolean;
  }>;
  // Computed/display properties
  amount_formatted?: string; // Formatted amount for display
  progress_number?: number; // Progress as number for calculations
}