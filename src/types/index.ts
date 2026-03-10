export type ApplicationStatus = 'Applied' | 'Interview' | 'Offer' | 'Rejected';

export interface Application {
  id: string;
  companyName: string;
  jobTitle: string;
  applicationDate: number | string;
  status: string;
  createdAt: number | string;
}
