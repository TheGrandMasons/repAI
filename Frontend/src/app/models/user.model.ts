export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  totalCashback: number;
  categories: string[];
}
