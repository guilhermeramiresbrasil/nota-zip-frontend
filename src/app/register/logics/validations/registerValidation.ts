import { RegisterFormData } from '@/app/login/types/auth.types';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export const PASSWORD_REQUIREMENTS = [
  'passwordMinLength',
  'passwordLowercase',
  'passwordUppercase',
  'passwordNumber',
  'passwordSpecial',
] as const;

export class RegisterValidation {
  validate(data: RegisterFormData): ValidationResult {
    const { name, email, password, confirmPassword } = data;

    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return { isValid: false, error: 'required' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'invalidEmail' };
    }

    if (password.length < 8) {
      return { isValid: false, error: 'passwordMinLength' };
    }

    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'passwordLowercase' };
    }

    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'passwordUppercase' };
    }

    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'passwordNumber' };
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return { isValid: false, error: 'passwordSpecial' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'passwordMismatch' };
    }

    return { isValid: true, error: null };
  }

  getPasswordRequirements(): string[] {
    return PASSWORD_REQUIREMENTS as unknown as string[];
  }

  checkRequirement(password: string, requirement: string): boolean {
    switch (requirement) {
      case 'passwordMinLength':
        return password.length >= 8;
      case 'passwordLowercase':
        return /[a-z]/.test(password);
      case 'passwordUppercase':
        return /[A-Z]/.test(password);
      case 'passwordNumber':
        return /[0-9]/.test(password);
      case 'passwordSpecial':
        return /[^A-Za-z0-9]/.test(password);
      default:
        return false;
    }
  }
}

export const registerValidation = new RegisterValidation();
