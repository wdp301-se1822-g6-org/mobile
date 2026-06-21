export type UserRole = 'customer' | 'washer' | 'cashier' | 'manager' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  dateOfBirth?: string;
  isActive: boolean;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  name: string;
  phone: string;
  email: string;
  password: string;
  dateOfBirth?: string;
};

export type OtpSendDto = { email: string };
export type OtpVerifyDto = { email: string; code: string };
export type OtpSendResponse = { message: string; token: string };
export type OtpVerifyResponse = { token: string };
