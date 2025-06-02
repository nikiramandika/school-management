"use client";

import * as Clerk from "@clerk/elements/common";
import * as SignIn from "@clerk/elements/sign-in";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const LoginPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    const role = user?.publicMetadata.role;

    if (role) {
      setIsAuthenticating(true);
      router.push(`/${role}`);
    }
  }, [user, router]);

  if (!isLoaded || isAuthenticating) {
    return (
      <div className="h-screen flex items-center justify-center bg-lamaSkyLight dark:bg-card">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-500 dark:text-gray-400">
            {isAuthenticating ? "Signing in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-signin h-screen flex flex-col items-center justify-between w-screen p-16 gap-16">
      <div className="p-8 rounded-md shadow-2xl flex flex-row gap-2 iniya">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Image
            src="https://smanlimedan.sch.id/wp-content/uploads/2024/07/LOGO_2-removebg-prev._imresizer-removebg-preview.png"
            alt="logo"
            width={32}
            height={32}
            unoptimized
          />{" "}
          SMAN 5 Medan
        </h1>
      </div>
      <SignIn.Root>
        <SignIn.Step
          name="start"
          className="p-12 rounded-md shadow-2xl  w-xl flex-col gap-8 iniya flex"
        >
          <h1 className="text-xl font-bold">Welcome Back</h1>
          <h1 className="text-gray-400 mb-4">Sign in to your account</h1>

          <Clerk.GlobalError className="text-sm text-red-400" />
          <Clerk.Field name="identifier" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-500">
              NISN/NIP
            </Clerk.Label>
            <Clerk.Input
              type="text"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>

          <Clerk.Field name="password" className="flex flex-col gap-2">
            <Clerk.Label className="text-sm text-gray-500">
              Password
            </Clerk.Label>
            <Clerk.Input
              type="password"
              required
              className="p-2 rounded-md ring-1 ring-gray-300"
            />
            <Clerk.FieldError className="text-xs text-red-400" />
          </Clerk.Field>
          <SignIn.Action
            submit
            className="bg-cyan-500  text-white my-1 rounded-md text-sm p-[10px] hover:bg-blue-600 transition-colors w-full"
            onClick={() => setIsButtonLoading(true)}
          >
            {isButtonLoading ? (
              <div className="flex items-center justify-center gap-2">
                <LoadingSpinner size="sm" />
                <span>Signing in...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </SignIn.Action>
        </SignIn.Step>
      </SignIn.Root>
    </div>
  );
};

export default LoginPage;
