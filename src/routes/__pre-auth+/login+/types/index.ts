export interface LoginFormValues {
  login: string;
  password: string;
}

export interface LoginResponse {
  mfaRequired?: boolean;
  tempToken?: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    username?: string;
    email?: string;
    role: string;
    canViewProfit: boolean;
    mfaEnabled?: boolean;
  };
  permissions?: string[];
}

export interface LoginActionData {
  error?: string;
  success?: boolean;
  data?: LoginResponse;
}
