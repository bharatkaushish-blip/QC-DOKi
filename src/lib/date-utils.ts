import { startOfDay, startOfWeek, startOfMonth, subDays, endOfDay } from "date-fns";

export function resolveDateRange(params: {
  from?: string;
  to?: string;
  preset?: string;
}): { dateFrom: Date; dateTo: Date } {
  if (params.from && params.to) {
    return {
      dateFrom: startOfDay(new Date(params.from)),
      dateTo: endOfDay(new Date(params.to)),
    };
  }

  const now = new Date();

  switch (params.preset) {
    case "today":
      return { dateFrom: startOfDay(now), dateTo: now };
    case "this_week":
      return { dateFrom: startOfWeek(now, { weekStartsOn: 1 }), dateTo: now };
    case "this_month":
      return { dateFrom: startOfMonth(now), dateTo: now };
    case "last_30_days":
      return { dateFrom: subDays(startOfDay(now), 30), dateTo: now };
    default:
      // Default to last 30 days
      return { dateFrom: subDays(startOfDay(now), 30), dateTo: now };
  }
}
