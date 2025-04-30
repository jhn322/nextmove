export type AuthMode = 'login' | 'register';

export interface AuthFormData {
  name?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface AuthFormProps {
  mode: AuthMode;
  onSubmit: (data: AuthFormData) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
} 