/**
 * Birthday Celebration Widget
 *
 * Shows members with birthdays this week. Hides when no birthdays.
 */

import { memo } from 'react';
import { Cake, PartyPopper } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';

interface BirthdayMember {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

interface BirthdayCelebrationWidgetProps {
  members: BirthdayMember[];
}

export const BirthdayCelebrationWidget = memo(function BirthdayCelebrationWidget({
  members = [],
}: BirthdayCelebrationWidgetProps) {
  if (!members || members.length === 0) {
    return null;
  }

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  return (
    <Card className="border-pink-200/50 bg-gradient-to-br from-pink-50/50 to-orange-50/30 dark:border-pink-800/30 dark:from-pink-950/20 dark:to-orange-950/10">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Cake className="h-5 w-5 text-pink-600 dark:text-pink-400" />
          Birthdays This Week
          <PartyPopper className="h-4 w-4 text-amber-500" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {members.map((member) => {
            const bday = new Date(member.dateOfBirth);
            const isToday = bday.getMonth() === todayMonth && bday.getDate() === todayDate;
            const bdayStr = new Date(
              today.getFullYear(),
              bday.getMonth(),
              bday.getDate()
            ).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/60 dark:hover:bg-white/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500/10 text-lg dark:bg-pink-400/10">
                  🎂
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{bdayStr}</p>
                </div>
                {isToday && (
                  <span className="rounded-full bg-pink-500/10 px-2 py-0.5 text-xs font-semibold text-pink-600 dark:text-pink-400">
                    Today! 🎉
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
});
