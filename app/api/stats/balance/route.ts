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

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({ from, to });

  if (!queryParams.success) {
    return Response.json(queryParams.error.message, { status: 400 });
  }

  const stats = await getBalanceStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );
  return Response.json(stats);
}

/* The GetBalanceStatsResponseType is a TypeScript type alias that represents the shape of the data returned by the getBalanceStats function. It uses the Awaited and ReturnType utility types to determine the exact type of the function's asynchronous return value */
export type GetBalanceStatsResponseType = Awaited<
  ReturnType<typeof getBalanceStats>
>;

/* The getBalanceStats function calculates a user's total income and expenses within a specified date range by grouping their transactions based on type (expense or income) and summing the amounts for each type. */
async function getBalanceStats(userId: string, from: Date, to: Date) {
  const totals = await prisma.transaction.groupBy({
    by: ["type"],
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
  });

  return {
    expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
    income: totals.find((t) => t.type === "income")?._sum.amount || 0,
  };
}
