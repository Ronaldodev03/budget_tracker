"use server";

import prisma from "@/lib/prisma";
import { UpdateUserCurrencySchema } from "@/app/schema/userSettings"; //schema from zod
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

//action
export async function UpdateUserCurrency(currency: string) {
  //zod check
  const parsedBody = UpdateUserCurrencySchema.safeParse({
    currency,
  });

  //error
  if (!parsedBody.success) {
    throw parsedBody.error;
  }

  //check user w clerk
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  //update currency
  const userSettings = await prisma.userSettings.update({
    where: {
      userId: user.id,
    },
    data: {
      currency,
    },
  });

  return userSettings;
}
