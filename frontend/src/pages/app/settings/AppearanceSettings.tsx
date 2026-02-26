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

const COMPACT_KEY = 'settings:compactMode';
const REDUCE_MOTION_KEY = 'settings:reduceMotion';

export default function AppearanceSettings() {
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
