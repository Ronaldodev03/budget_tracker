import { OverviewQuerySchema } from "@/app/schema/overview";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//GET
export async function GET(request: Request) {
  // Verify with clerk if user exists
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const stats = await getCategoriesStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );

  return Response.json(stats);
}

/* GetBalanceStatsResponseType is a TypeScript type alias that represents the awaited return type of the getCategoriesStats function. In simpler terms, it's a way to define the shape of the data that the getCategoriesStats function will return once it has finished executing and the promise has resolved. */
export type GetCategoriesStatsResponseType = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

/* The function groups transactions by type, category, and categoryIcon, filters them by userId and the date range, and then sums the amount for each group. It sorts the results in descending order based on the summed amounts */
/* Grouping transactions by type, category, and categoryIcon means that the function organizes the transactions into sets based on these three fields. For example, all transactions with the same type (like income or expense), within the same category (such as groceries or entertainment), and associated with the same icon are placed together. This grouping allows the function to perform calculations, like summing the amounts for each group, giving a clear breakdown of total spending or income in each category and type. */
async function getCategoriesStats(userId: string, from: Date, to: Date) {
  const stats = await prisma.transaction.groupBy({
    by: ["type", "category", "categoryIcon"],
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    _sum: {
      amount: true,
    },
    orderBy: {
      _sum: {
        amount: "desc",
      },
    },
  });

  return stats;
}
