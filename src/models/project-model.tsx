export interface Project {
  id: string
  title: string
  description: string
  amount: string
  contractor: string
  location: string
  status: string
  progress: number
  likes: number
  dislikes: number
  comments: number
  image: string
  expectedOutcome: string
  personnel: string
  reason: string
  startDate: Date;
  expectedCompletionDate: Date;
  milestones: { title: string; date: Date; completed: boolean }[]
}