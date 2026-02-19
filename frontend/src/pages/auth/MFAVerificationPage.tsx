/**
 * MFA Verification Page
 *
 * Handles MFA verification during the login flow:
 * - TOTP code input
 * - Backup code option
 * - Error handling
 *
 * T297: Create MFA verification page
 */

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { mfaService } from '@/services/endpoints/mfaService';
import { useAuth } from '@/hooks/useAuth';

interface LocationState {
  mfaToken: string;
  email: string;
}

export default function MFAVerificationPage() {
  const [code, setCode] = useState('');
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { completeMFALogin } = useAuth();

  const state = location.state as LocationState | undefined;

  useEffect(() => {
    if (!state?.mfaToken) {
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);

  if (!state?.mfaToken) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!useBackupCode && code.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    if (useBackupCode && code.length < 8) {
      setError('Please enter a valid backup code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await mfaService.verifyLogin(
        state.mfaToken,
        useBackupCode ? undefined : code,
        useBackupCode ? code : undefined
      );

      // Complete the login process
      completeMFALogin(response);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            {useBackupCode
              ? 'Enter one of your backup codes'
              : 'Enter the code from your authenticator app'}
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="mb-4 text-center text-sm text-muted-foreground">
              Signing in as <span className="font-medium text-foreground">{state.email}</span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                {useBackupCode ? 'Backup Code' : 'Verification Code'}
              </label>
              <Input
                type="text"
                inputMode={useBackupCode ? 'text' : 'numeric'}
                pattern={useBackupCode ? undefined : '[0-9]*'}
                maxLength={useBackupCode ? 9 : 6}
                placeholder={useBackupCode ? 'XXXX-XXXX' : '000000'}
                value={code}
                onChange={(e) =>
                  setCode(
                    useBackupCode ? e.target.value.toUpperCase() : e.target.value.replace(/\D/g, '')
                  )
                }
                className="text-center text-2xl tracking-widest"
                autoFocus
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode);
                  setCode('');
                  setError('');
                }}
                className="cursor-pointer text-sm text-primary underline transition-colors duration-200 hover:text-primary/80"
              >
                {useBackupCode ? 'Use authenticator code instead' : 'Use backup code'}
              </button>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              disabled={loading || code.length < (useBackupCode ? 8 : 6)}
              className="w-full"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/login')}
              className="w-full"
            >
              Back to Login
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
