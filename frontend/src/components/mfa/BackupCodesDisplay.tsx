/**
 * Backup Codes Display Component
 *
 * Displays backup codes after MFA enrollment with:
 * - Copyable code display
 * - Download option
 * - Print option
 * - Confirmation before proceeding
 *
 * T298: Create backup codes display component
 */

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';

interface BackupCodesDisplayProps {
  codes: string[];
  onComplete: () => void;
}

export default function BackupCodesDisplay({ codes, onComplete }: BackupCodesDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleCopy = async () => {
    const text = codes.join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `Sing Buri Adventist Center - MFA Backup Codes
Generated: ${new Date().toISOString()}

Keep these codes safe! Each code can only be used once.

${codes.join('\n')}

If you lose access to your authenticator app, you can use one of these codes to sign in.
`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'backup-codes.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>MFA Backup Codes</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { font-size: 18px; margin-bottom: 10px; }
              .date { font-size: 12px; color: #666; margin-bottom: 20px; }
              .codes { font-family: monospace; font-size: 16px; line-height: 2; }
              .code { display: inline-block; width: 45%; margin-bottom: 10px; }
              .note { font-size: 12px; color: #666; margin-top: 20px; }
            </style>
          </head>
          <body>
            <h1>Sing Buri Adventist Center - MFA Backup Codes</h1>
            <p class="date">Generated: ${new Date().toLocaleDateString()}</p>
            <div class="codes">
              ${codes.map((code) => `<span class="code">${code}</span>`).join('')}
            </div>
            <p class="note">Keep these codes safe! Each code can only be used once.</p>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-center text-2xl font-bold text-green-600">
          ✓ MFA Enabled Successfully
        </CardTitle>
        <CardDescription className="text-center">
          Save your backup codes in a secure location
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Important:</strong> If you lose access to your authenticator app, you'll need
            these codes to sign in. Each code can only be used once. Store them safely!
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-4 font-mono text-sm">
          {codes.map((code, index) => (
            <div key={index} className="rounded px-2 py-1 hover:bg-gray-200">
              {code}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? '✓ Copied!' : 'Copy Codes'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            Print
          </Button>
        </div>

        <div className="border-t pt-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">
              I have saved my backup codes in a secure location
            </span>
          </label>
        </div>
      </CardContent>

      <CardFooter>
        <Button onClick={onComplete} disabled={!confirmed} className="w-full">
          Continue to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
