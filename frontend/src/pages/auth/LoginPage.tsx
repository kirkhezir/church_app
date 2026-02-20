/**
 * Login Page Component
 *
 * Split-panel authentication interface:
 * - Left: Church hero imagery + branding (hidden on mobile)
 * - Right: Clean sign-in form with shadcn/ui Card
 *
 * Design System: design-system/pages/auth.md
 * Colors: Primary blue + warm amber accent
 * Typography: Lexend headings + Source Sans 3 body
 */

import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '@/hooks/useAuth';
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
import { LogIn, BookOpen, Users, Heart, ChevronLeft } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);

      // Check if MFA is required
      if (result?.mfaRequired) {
        navigate('/mfa-verify', {
          state: {
            mfaToken: result.mfaToken,
            email: result.email,
          },
        });
        return;
      }

      // Redirect to dashboard after successful login
      navigate('/app/dashboard');
    } catch (err: any) {
      // Use generic message to prevent user enumeration
      const message = err.message?.toLowerCase();
      if (message?.includes('locked') || message?.includes('too many')) {
        setError(err.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel — Church Hero (hidden on mobile) */}
      <div className="relative hidden w-1/2 lg:block">
        <img
          src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1200&h=1600&fit=crop&q=80"
          alt="Church interior with warm light"
          className="absolute inset-0 h-full w-full object-cover"
          width={1200}
          height={1600}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-slate-900/80" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          {/* Logo + Name — links back to landing page */}
          <Link to="/" className="flex items-center gap-3 transition-opacity hover:opacity-80">
            <img
              src="/church-logo.png"
              alt="Sing Buri Adventist Center"
              className="h-10 w-10 rounded-full border-2 border-white/20 object-contain"
              width={40}
              height={40}
            />
            <span className="text-lg font-semibold text-white/90">Sing Buri Adventist Center</span>
          </Link>

          {/* Welcome Message */}
          <div className="max-w-md">
            <h1 className="mb-4 text-balance text-4xl font-bold leading-tight text-white">
              Welcome back to your church community
            </h1>
            <p className="mb-8 text-lg text-blue-100/80">
              Stay connected with events, announcements, and your church family.
            </p>

            {/* Feature highlights */}
            <div className="space-y-4">
              {[
                { icon: BookOpen, text: 'Access sermons and resources' },
                { icon: Users, text: 'Connect with your church family' },
                { icon: Heart, text: 'RSVP to events and activities' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
                    <Icon className="h-4 w-4 text-amber-300" />
                  </div>
                  <span className="text-sm text-white/80">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom attribution */}
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Sing Buri Adventist Center
          </p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full items-center justify-center bg-background px-4 py-12 sm:px-6 lg:w-1/2 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to home — always visible */}
          <Link
            to="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to home
          </Link>

          {/* Mobile-only logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/church-logo.png"
              alt="Sing Buri Adventist Center"
              className="h-12 w-12 rounded-full object-contain"
              width={48}
              height={48}
            />
            <span className="text-lg font-semibold text-foreground">
              Sing Buri Adventist Center
            </span>
          </div>

          <Card className="border-0 shadow-none lg:border lg:shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-center text-2xl font-bold tracking-tight">
                Sign In
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    spellCheck={false}
                    autoCapitalize="none"
                    className="transition-colors duration-200"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    className="transition-colors duration-200"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    to="/password-reset-request"
                    className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                  {loading ? (
                    'Signing in\u2026'
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{' '}
                  <span className="text-muted-foreground/70">
                    Contact your church administrator
                  </span>
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
