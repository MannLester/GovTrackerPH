export interface FactReports {
    report_id: string;
    report_type: 'project' | 'comment';
    reportee_id: string;
    reason: string;
    user_id: string;
    reported_date: Date;
    created_at: Date;
    updated_at: Date;
}
