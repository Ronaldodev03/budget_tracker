import { OverviewQuerySchema } from "@/app/schema/overview";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//GET
export async function GET(request: Request) {
  // Verify with clerk if user exists
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const periods = await getHistoryPeriods(user.id);
  return Response.json(periods);
}

/* The GetBalanceStatsResponseType is a TypeScript type alias that represents the shape of the data returned by the getHistoryPeriods function. It uses the Awaited and ReturnType utility types to determine the exact type of the function's asynchronous return value */
export type GetHistoryPeriodsResponseType = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

/* The getHistoryPeriods function calculates a user's total income and expenses within a specified date range by grouping their transactions based on type (expense or income) and summing the amounts for each type. */
async function getHistoryPeriods(userId: string) {
  const result = await prisma.monthHistory.findMany({
    where: {
      userId,
    },
    select: {
      year: true,
    },
    distinct: ["year"],
    orderBy: [
      {
        year: "asc",
      },
    ],
  });

  const years = result.map((el) => el.year);

  if (years.length === 0) {
    //return the current year
    return [new Date().getFullYear()];
  }
  return years;
}
