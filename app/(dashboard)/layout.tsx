import Navbar from "@/app/components/Navbar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

async function layout({ children }: { children: ReactNode }) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="relative flex h-screen w-full flex-col">
      <Navbar />
      <div className="w-full">{children}</div>
    </div>
  );
}

export default layout;
