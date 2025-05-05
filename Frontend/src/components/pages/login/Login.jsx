import { GalleryVerticalEnd, SeparatorHorizontal } from "lucide-react";
import { LoginForm } from "./LoginForm";
import image1 from "../../../assets/image1.jpg"

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 p-1 ">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <div className="flex">
              <span className="text-[#FD8D04]">Sud</span>
              <span className="text-[#0E2C86]">Invest</span>
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <LoginForm />
          </div>
        
        </div>
      </div>
      <div className="relative hidden lg:block rounded-xl overflow-hidden">
        <img
          src={image1}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover    dark:brightness-[0.7] "
        />
      </div>
    </div>
  );
}
