import { Button } from '@/components/ui/button';
import type { AuthFooterProps } from './types';

export const AuthFooter = ({ mode, onNavigate }: AuthFooterProps) => (
  <p className='text-sm text-gray-600'>
    {mode === 'login' ? 'Har du inget konto?' : 'Har du redan ett konto?'}{' '}
    <Button variant='link' className='p-0' onClick={onNavigate}>
      {mode === 'login' ? 'Registrera dig' : 'Logga in'}
    </Button>
  </p>
);
