export type Role = "CUSTOMER" | "ADMIN";

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
};
