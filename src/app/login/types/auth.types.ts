export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData extends LoginFormData {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
}
