export interface User {
  _id?: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  password: string;
  role?: "admin" | "user";
  otp?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
