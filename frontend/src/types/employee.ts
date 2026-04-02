export interface PTOBalance {
  totalAnnual: number;
  remaining: number;
  taken: number;
}

export interface PTORequest {
  id: string;
  type: 'PTO' | 'Sick' | 'Personal';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employeeName?: string;
}

export interface OTRequest {
  id: string;
  date: string;
  hours: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  employeeName?: string;
}
