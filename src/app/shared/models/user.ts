export interface UserSettings {
  notifications: boolean;
  language: string;
  currency: string;
  twoFactorAuth: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  theme: string;
}

export interface User {
  id: string;
  username?: string;
  name?: string;
  email: string;
  password: string;
  settings?: UserSettings;
}

export interface UserResponse {
  message: string;
  result: User;
}

export interface UsersListResponse {
  message: string;
  result: User[];
}
