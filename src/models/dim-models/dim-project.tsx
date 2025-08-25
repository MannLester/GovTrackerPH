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