export type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
export type ApplicationPriority = 'High' | 'Medium' | 'Low';
export type ApplicationProgressTag =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Rejected';

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationDate: number | string;
  followUpDate?: number | string | null;
  status: ApplicationStatus;
  createdAt: number | string;
  jobLink?: string | null;
  notes?: string | null;
  priority?: ApplicationPriority | null;
  progressTag?: ApplicationProgressTag | null;
}
