export interface User {
  id: string;
  name: string;
  email: string;
  emailConfirmed: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileRequest {
  name: string;
}

export interface Investment {
  id: string;
  name: string;
  type: "simples" | "composta";
  principal: number;
  rate: number;
  period: number;
  finalAmount: number;
  profit: number;
  createdAt: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
