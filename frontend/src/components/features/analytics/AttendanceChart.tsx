/**
 * Attendance Chart Component
 *
 * Displays attendance trends over time using a simple bar chart
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { cn } from '../../../lib/utils';

interface AttendanceData {
  date: string;
  eventName: string;
  attendance: number;
  capacity?: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
  title?: string;
  showCapacity?: boolean;
}

export function AttendanceChart({
  data,
  title = 'Attendance Trends',
  showCapacity = true,
}: AttendanceChartProps) {
  const maxAttendance = useMemo(() => {
    const maxValue = Math.max(...data.map((d) => d.attendance));
    const maxCapacity = Math.max(...data.map((d) => d.capacity || 0));
    return Math.max(maxValue, maxCapacity, 1);
  }, [data]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No attendance data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart */}
          <div className="flex h-[200px] items-end gap-2">
            {data.slice(-12).map((item, index) => {
              const heightPercent = (item.attendance / maxAttendance) * 100;
              const capacityPercent = item.capacity ? (item.capacity / maxAttendance) * 100 : null;

              return (
                <div key={index} className="group relative flex flex-1 flex-col items-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden rounded-md bg-popover p-2 text-xs shadow-md group-hover:block">
                    <div className="font-semibold">{item.eventName}</div>
                    <div>{formatDate(item.date)}</div>
                    <div>Attendance: {item.attendance}</div>
                    {item.capacity && <div>Capacity: {item.capacity}</div>}
                  </div>

                  {/* Bar container */}
                  <div className="relative flex h-full w-full flex-col justify-end">
                    {/* Capacity marker */}
                    {showCapacity && capacityPercent && (
                      <div
                        className="absolute left-0 right-0 border-t-2 border-dashed border-muted-foreground/30"
                        style={{ bottom: `${capacityPercent}%` }}
                      />
                    )}

                    {/* Attendance bar */}
                    <div
                      className={cn(
                        'w-full rounded-t transition-all hover:opacity-80',
                        item.capacity && item.attendance >= item.capacity
                          ? 'bg-green-500'
                          : 'bg-primary'
                      )}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Label */}
                  <div className="mt-2 text-xs text-muted-foreground">{formatDate(item.date)}</div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-primary" />
              <span>Attendance</span>
            </div>
            {showCapacity && (
              <div className="flex items-center gap-2">
                <div className="h-0 w-8 border-t-2 border-dashed border-muted-foreground/50" />
                <span>Capacity</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span>Full</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Attendance Summary Stats
 */
interface AttendanceSummaryProps {
  data: AttendanceData[];
}

export function AttendanceSummary({ data }: AttendanceSummaryProps) {
  const stats = useMemo(() => {
    if (data.length === 0) {
      return { average: 0, highest: 0, lowest: 0, total: 0 };
    }

    const attendances = data.map((d) => d.attendance);
    return {
      average: Math.round(attendances.reduce((a, b) => a + b, 0) / attendances.length),
      highest: Math.max(...attendances),
      lowest: Math.min(...attendances),
      total: attendances.reduce((a, b) => a + b, 0),
    };
  }, [data]);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold tabular-nums">{stats.average}</div>
          <div className="text-sm text-muted-foreground">Avg. Attendance</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold tabular-nums">{stats.highest}</div>
          <div className="text-sm text-muted-foreground">Highest</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold tabular-nums">{stats.lowest}</div>
          <div className="text-sm text-muted-foreground">Lowest</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-2xl font-bold tabular-nums">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Attendees</div>
        </CardContent>
      </Card>
    </div>
  );
}
