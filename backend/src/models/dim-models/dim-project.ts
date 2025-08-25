export interface Project {
  project_id: string;
  title: string;
  description: string;
  amount: number;
  status_id: string;
  contractor_id: string;
  location_id: string;
  progress: string;
  expected_outcome: string;
  reason: string;
  start_date: Date;
  expected_completion_date: Date;
  created_at: Date;
}

export const ProjectSchema = {
  project_id: String,
  title: String,
  description: String,
  amount: Number,
  status_id: String,
  contractor_id: String,
  location_id: String,
  progress: String,
  expected_outcome: String,
  reason: String,
  start_date: Date,
  expected_completion_date: Date,
  created_at: Date,
}