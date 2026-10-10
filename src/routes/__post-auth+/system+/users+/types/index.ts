export interface UserAccount {
  id: number;
  name: string;
  email: string;
  roleId: number;
  role?: {
    id: number;
    name: string;
  };
}
