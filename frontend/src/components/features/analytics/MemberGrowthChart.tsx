/**
 * Member Growth Chart Component
 *
 * Displays member growth trends over time
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface MemberGrowthData {
  month: string;
  totalMembers: number;
  newMembers: number;
  churnedMembers: number;
}

interface MemberGrowthChartProps {
  data: MemberGrowthData[];
  title?: string;
}

export function MemberGrowthChart({ data, title = 'Member Growth' }: MemberGrowthChartProps) {
  const maxValue = useMemo(() => {
    return Math.max(...data.map((d) => d.totalMembers), 1);
  }, [data]);

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No growth data available
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
          {/* Line Chart Area */}
          <div className="relative h-[200px]">
            {/* Y-axis labels */}
            <div className="absolute left-0 flex h-full flex-col justify-between text-xs text-muted-foreground">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue / 2)}</span>
              <span>0</span>
            </div>

            {/* Chart area */}
            <div className="ml-8 flex h-full items-end gap-1">
              {data.slice(-12).map((item) => {
                const heightPercent = (item.totalMembers / maxValue) * 100;

                return (
                  <div
                    key={item.month}
                    className="group relative flex flex-1 flex-col items-center"
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full z-10 mb-2 hidden w-32 rounded-md bg-popover p-2 text-xs shadow-md group-hover:block">
                      <div className="font-semibold">{formatMonth(item.month)}</div>
                      <div>Total: {item.totalMembers}</div>
                      <div className="text-green-600">+{item.newMembers} new</div>
                      {item.churnedMembers > 0 && (
                        <div className="text-red-600">-{item.churnedMembers} left</div>
                      )}
                    </div>

                    {/* Bar */}
                    <div className="relative flex h-full w-full flex-col justify-end">
                      <div
                        className="w-full rounded-t bg-primary/20 transition-all hover:bg-primary/30"
                        style={{ height: `${heightPercent}%` }}
                      >
                        {/* Growth indicator */}
                        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary" />
                      </div>
                    </div>

                    {/* X-axis label */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {formatMonth(item.month)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Growth Stats */}
          <div className="flex justify-center gap-8 border-t pt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                +{data.reduce((sum, d) => sum + d.newMembers, 0)}
              </div>
              <div className="text-xs text-muted-foreground">New Members</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                -{data.reduce((sum, d) => sum + d.churnedMembers, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Left</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">
                {data.length > 0 ? data[data.length - 1].totalMembers : 0}
              </div>
              <div className="text-xs text-muted-foreground">Current Total</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Member Demographics Card
 */
interface DemographicsData {
  label: string;
  value: number;
  color: string;
}

interface MemberDemographicsProps {
  data: DemographicsData[];
  title?: string;
}

export function MemberDemographics({
  data,
  title = 'Member Demographics',
}: MemberDemographicsProps) {
  const total = useMemo(() => data.reduce((sum, d) => sum + d.value, 0), [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Horizontal bar chart */}
          {data.map((item) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;

            return (
              <div key={item.label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">
                    {item.value} ({percentage.toFixed(0)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
