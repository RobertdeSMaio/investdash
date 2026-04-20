import type {
  AuthTokens,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  User,
} from "../types";
import api from "./api";

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const res = await api.post("/api/auth/login", data);
    return res.data;
  },

  async register(data: RegisterRequest): Promise<{ message: string }> {
    const res = await api.post("/api/auth/register", data);
    return res.data;
  },

  async confirmEmail(
    token: string,
    email: string,
  ): Promise<{ message: string }> {
    const res = await api.get(
      `/auth/confirm-email?token=${token}&email=${encodeURIComponent(email)}`,
    );
    return res.data;
  },

  async forgotPassword(
    data: ForgotPasswordRequest,
  ): Promise<{ message: string }> {
    const res = await api.post("/api/auth/forgot-password", data);
    return res.data;
  },

  async resetPassword(
    data: ResetPasswordRequest,
  ): Promise<{ message: string }> {
    const res = await api.post("/api/auth/reset-password", data);
    return res.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/api/auth/logout", { refreshToken });
  },

  async getProfile(): Promise<User> {
    const res = await api.get("/api/profile");
    return res.data;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const res = await api.put("/api/profile", data);
    return res.data;
  },

  async changePassword(
    data: ChangePasswordRequest,
  ): Promise<{ message: string }> {
    const res = await api.put("/api/profile/change-password", data);
    return res.data;
  },

  async resendConfirmation(): Promise<{ message: string }> {
    const res = await api.post("/api/auth/resend-confirmation");
    return res.data;
  },
};
