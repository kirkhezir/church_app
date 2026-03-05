/**
 * Prayer Requests Widget
 *
 * Shows recent public prayer requests with category and prayer count.
 */

import { Link } from 'react-router';
import { memo } from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';

interface PrayerRequest {
  id: string;
  name: string;
  category: string;
  request: string;
  isAnonymous: boolean;
  prayerCount: number;
  createdAt: string;
}

interface PrayerRequestsWidgetProps {
  requests: PrayerRequest[];
}

export const PrayerRequestsWidget = memo(function PrayerRequestsWidget({
  requests = [],
}: PrayerRequestsWidgetProps) {
  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            Prayer Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Heart className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No prayer requests yet</p>
            <Link to="/app/prayer" className="mt-2">
              <Button variant="link" size="sm">
                Submit a Request
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          Prayer Requests
        </CardTitle>
        <Link to="/app/prayer">
          <Button variant="ghost" size="sm" className="gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className="rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/20 hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      {req.isAnonymous ? 'Anonymous' : req.name}
                    </p>
                    <Badge variant="outline" className="text-[10px]">
                      {req.category}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-foreground">{req.request}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3 w-3" />
                  {req.prayerCount} {req.prayerCount === 1 ? 'prayer' : 'prayers'}
                </span>
                <Link to="/app/prayer">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400"
                  >
                    <Heart className="h-3 w-3" />
                    Pray
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
