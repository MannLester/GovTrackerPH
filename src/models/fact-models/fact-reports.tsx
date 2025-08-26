export interface FactReports {
    reportId: string;
    reportType: 'project' | 'comment';
    reporteeId: string;
    reason: string;
    userId: string;
    reportedDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
