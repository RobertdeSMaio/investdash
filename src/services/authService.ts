import api from "./api";
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  User,
  AuthTokens,
} from "../types";

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  async confirmEmail(token: string, email: string): Promise<{ message: string }> {
    const res = await api.get(`/auth/confirm-email?token=${token}&email=${encodeURIComponent(email)}`);
    return res.data;
  },

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    const res = await api.post("/auth/forgot-password", data);
    return res.data;
  },

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    const res = await api.post("/auth/reset-password", data);
    return res.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },

  async getProfile(): Promise<User> {
    const res = await api.get("/profile");
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const res = await api.put("/profile", data);
    return res.data;
  },

  async changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
    const res = await api.put("/profile/change-password", data);
    return res.data;
  },

  async resendConfirmation(): Promise<{ message: string }> {
    const res = await api.post("/auth/resend-confirmation");
    return res.data;
  },
};
