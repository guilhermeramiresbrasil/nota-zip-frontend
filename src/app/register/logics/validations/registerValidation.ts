import { RegisterFormData } from '@/app/login/types/auth.types';

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export class RegisterValidation {
  validate(data: RegisterFormData): ValidationResult {
    const { name, email, password, confirmPassword } = data;

    // Check if all fields are filled
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return { isValid: false, error: 'Todos os campos são obrigatórios' };
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Email inválido' };
    }

    // Check password length
    if (password.length < 8) {
      return { isValid: false, error: 'A senha deve ter pelo menos 8 caracteres' };
    }

    // Check password has at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return { isValid: false, error: 'A senha deve ter pelo menos uma letra minúscula' };
    }

    // Check password has at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, error: 'A senha deve ter pelo menos uma letra maiúscula' };
    }

    // Check password has at least one number
    if (!/[0-9]/.test(password)) {
      return { isValid: false, error: 'A senha deve ter pelo menos um número' };
    }

    // Check password match
    if (password !== confirmPassword) {
      return { isValid: false, error: 'As senhas não coincidem' };
    }

    return { isValid: true, error: null };
  }

  getPasswordRequirements(): string[] {
    return [
      'Pelo menos 8 caracteres',
      'Pelo menos uma letra minúscula',
      'Pelo menos uma letra maiúscula',
      'Pelo menos um número',
    ];
  }

  checkRequirement(password: string, requirement: string): boolean {
    switch (requirement) {
      case 'Pelo menos 8 caracteres':
        return password.length >= 8;
      case 'Pelo menos uma letra minúscula':
        return /[a-z]/.test(password);
      case 'Pelo menos uma letra maiúscula':
        return /[A-Z]/.test(password);
      case 'Pelo menos um número':
        return /[0-9]/.test(password);
      default:
        return false;
    }
  }
}

export const registerValidation = new RegisterValidation();
