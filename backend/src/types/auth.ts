export type AuthenticatedUser = {
  id: string;
  email: string;
  role: string;
  fullName: string;
  status: string;
  department?: string | null;
};
