"use client";

import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { UserSettings } from "@prisma/client";
import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import StatsCards from "./StatsCards";
import CategoryStats from "./CategoryStats";

const Overview = ({ userSettings }: { userSettings: UserSettings }) => {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: startOfMonth(new Date()),
    to: new Date(),
  });

  return (
    <>
      <div className=" lg:container lg:mx-auto px-8 flex flex-wrap items-end justify-between gap-2 py-6">
        <h2 className=" text-3xl font-bold">Overview</h2>
        <div className=" flex items-center gap-3">
          <DateRangePicker
            initialDateFrom={dateRange.from}
            initialDateTo={dateRange.to}
            showCompare={false}
            onUpdate={(value) => {
              const { from, to } = value.range;

              // we update the date range only if both dates are set

              if (!from || !to) return;

              if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
                toast.error(
                  `The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE_DAYS} days! `
                );
                return;
              }

              setDateRange({ from, to });
            }}
          />
        </div>
        <StatsCards
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />

        <CategoryStats
          userSettings={userSettings}
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>
    </>
  );
};

export default Overview;
