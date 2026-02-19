/**
 * MFA Enrollment Page
 *
 * Guides users through the MFA enrollment process:
 * - Display QR code for authenticator app
 * - Show secret key for manual entry
 * - Verify TOTP code to complete enrollment
 *
 * T296: Create MFA enrollment page
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
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
import BackupCodesDisplay from '@/components/mfa/BackupCodesDisplay';

export default function MFAEnrollmentPage() {
  const [step, setStep] = useState<'loading' | 'scan' | 'verify' | 'backup'>('loading');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    initializeEnrollment();
  }, []);

  const initializeEnrollment = async () => {
    try {
      setLoading(true);
      const response = await mfaService.enroll();
      setQrCodeUrl(response.qrCodeUrl);
      setSecret(response.secret);
      setStep('scan');
    } catch (err: any) {
      if (err.message?.includes('already enabled')) {
        setError('MFA is already enabled on your account.');
        setStep('scan');
      } else {
        setError(err.message || 'Failed to initialize MFA enrollment');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a 6-digit code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const response = await mfaService.verify(verificationCode, secret);
      setBackupCodes(response.backupCodes);
      setStep('backup');
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    navigate('/app/dashboard');
  };

  if (step === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Setting up MFA…</p>
        </div>
      </div>
    );
  }

  if (step === 'backup') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-lg">
          <BackupCodesDisplay codes={backupCodes} onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold">
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription className="text-center">
            Enhance your account security with an authenticator app
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>

              {qrCodeUrl && (
                <div className="mb-4 flex justify-center">
                  <img src={qrCodeUrl} alt="MFA QR Code" className="h-48 w-48 rounded-lg border" />
                </div>
              )}
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                {showSecret ? 'Hide' : "Can't scan? Show secret key"}
              </button>

              {showSecret && (
                <div className="mt-2 break-all rounded bg-muted p-3 font-mono text-sm">
                  {secret}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <label className="mb-2 block text-sm font-medium text-foreground/80">
                Enter the 6-digit code from your authenticator app
              </label>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl tracking-widest"
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-3">
          <Button
            onClick={handleVerify}
            disabled={loading || verificationCode.length !== 6}
            className="w-full"
          >
            {loading ? 'Verifying...' : 'Verify and Enable MFA'}
          </Button>

          <Button variant="ghost" onClick={() => navigate('/app/dashboard')} className="w-full">
            Skip for Now
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
