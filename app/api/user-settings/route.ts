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

  //filter user-settings by id
  let userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    },
  });

  //if new user --> create user-setting w this default
  if (!userSettings) {
    userSettings = await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "USD",
      },
    });
  }

  // Revalidate the home page that uses the user currency
  revalidatePath("/");

  //return user-settings
  return Response.json(userSettings);
}
