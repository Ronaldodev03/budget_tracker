import Logo from "@/app/components/Logo";
import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=" relative flex h-screen w-full flex-col items-center justify-center">
      <Logo />
      <div className=" mt-12">{children}</div>
    </div>
  );
};

export default layout;
