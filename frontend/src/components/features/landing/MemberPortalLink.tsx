/**
 * Member Portal Link Component
 *
 * Floating button or sticky header link to member dashboard
 * Provides quick access for existing members to log in
 */

import { Link } from 'react-router';
import { Button } from '../../ui/button';
import { LogIn, User, ArrowRight } from 'lucide-react';

interface MemberPortalLinkProps {
  variant?: 'floating' | 'header' | 'inline';
}

export function MemberPortalLink({ variant = 'floating' }: MemberPortalLinkProps) {
  if (variant === 'floating') {
    return (
      <div className="fixed left-6 top-1/2 z-50 -translate-y-1/2">
        <Link to="/login">
          <Button className="group flex h-auto flex-col items-center gap-2 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 px-4 py-4 shadow-2xl transition-all hover:from-blue-600 hover:to-purple-600">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-transform group-hover:scale-110">
              <User className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-white">Member Login</span>
          </Button>
        </Link>
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <Link to="/login">
        <Button
          variant="outline"
          className="gap-2 border-2 border-white bg-transparent text-white hover:bg-white hover:text-blue-700"
        >
          <LogIn className="h-4 w-4" />
          Member Login
        </Button>
      </Link>
    );
  }

  // Inline variant
  return (
    <div className="rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Already a Member?</h3>
            <p className="text-gray-300">Access your dashboard, events, and more</p>
          </div>
        </div>
        <Link to="/login">
          <Button size="lg" className="gap-2 bg-white text-foreground hover:bg-blue-50">
            <LogIn className="h-5 w-5" />
            Login to Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default MemberPortalLink;
