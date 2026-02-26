/**
 * Appearance Settings
 *
 * Display preferences and regional settings.
 * Rendered inside SettingsLayout as a nested route.
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { Sun, Moon, Monitor } from 'lucide-react';

const COMPACT_KEY = 'settings:compactMode';
const REDUCE_MOTION_KEY = 'settings:reduceMotion';

const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
  { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
];

export default function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const [compactMode, setCompactMode] = useState(
    () => localStorage.getItem(COMPACT_KEY) === 'true'
  );
  const [reduceMotion, setReduceMotion] = useState(
    () => localStorage.getItem(REDUCE_MOTION_KEY) === 'true'
  );

  useEffect(() => {
    localStorage.setItem(COMPACT_KEY, String(compactMode));
    document.documentElement.classList.toggle('compact', compactMode);
  }, [compactMode]);

  useEffect(() => {
    localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
  }, [reduceMotion]);

  return (
    <div className="space-y-6">
      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Theme</CardTitle>
          <CardDescription>Choose your preferred color scheme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {themeOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-sm transition-colors ${
                  theme === opt.value
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Display Preferences</CardTitle>
          <CardDescription>Customize how the app appears to you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="compact-mode">Compact Mode</Label>
              <p className="text-sm text-muted-foreground">
                Use a more condensed layout with smaller elements
              </p>
            </div>
            <Switch id="compact-mode" checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduce-motion">Reduce Motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations throughout the app
              </p>
            </div>
            <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={setReduceMotion} />
          </div>
        </CardContent>
      </Card>

      {/* Language & Region */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Language & Region</CardTitle>
          <CardDescription>Set your preferred language and date format</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Language and regional settings will be available in a future update.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
