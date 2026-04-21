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

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; confirmPassword: string; }
export interface ChangePasswordRequest { currentPassword: string; newPassword: string; confirmNewPassword: string; }
export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { token: string; email: string; newPassword: string; confirmNewPassword: string; }
export interface UpdateProfileRequest { name: string; }

export interface Simulation {
  id: string;
  name: string;
  type: "simples" | "composta";
  principal: number;
  rate: number;
  period: number;
  periodUnit: "mensal" | "anual";
  contribution: number;
  contributionFrequency: "mensal" | "anual";
  finalAmount: number;
  totalInvested: number;
  profit: number;
  createdAt: string;
}
export type Investment = Simulation;

export type AssetType = "acao" | "fii" | "etf" | "stock" | "renda_fixa";

export interface PortfolioAsset {
  id: string;
  ticker: string;
  name: string;
  type: AssetType;
  quantity: number;
  avgPrice: number;
  contributions: number;
  currentPrice?: number;
  currentValue?: number;
  profitLoss?: number;
  profitLossPct?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Quote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  high: number;
  low: number;
  updatedAt: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
