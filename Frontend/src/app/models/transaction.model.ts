export interface Transaction {
  id: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;  // Optional field
  status?: 'pending' | 'completed' | 'failed';
  merchant?: string;
  cashbackEarned?: number;
}