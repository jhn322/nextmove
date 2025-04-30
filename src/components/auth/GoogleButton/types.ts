export interface GoogleButtonProps {
  mode: 'login' | 'register';
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  isLoading?: boolean;
} 