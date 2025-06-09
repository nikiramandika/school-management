"use client";

import { useSignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const LoginPage = () => {
  const { isLoaded: isUserLoaded, isSignedIn, user } = useUser();
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  useEffect(() => {
    const userRole = user?.publicMetadata.role;
    if (userRole) {
      setIsAuthenticating(true);
      router.push(`/${userRole}`);
    }
  }, [user, router]);

  if (!isUserLoaded || !isSignInLoaded || isAuthenticating) {
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsButtonLoading(true);

    // Cek apakah input adalah admin atau kepala sekolah
    const isAdmin = identifier.toLowerCase() === "admin";
    const isKepalaSekolah = identifier.toLowerCase() === "kepalasekolah";

    // Jika bukan admin atau kepala sekolah, cek format NIP/NISN
    if (!isAdmin && !isKepalaSekolah) {
      const isNIP = /^\d{18}$/.test(identifier); // NIP biasanya 18 digit
      const isNISN = /^\d{10}$/.test(identifier); // NISN biasanya 10 digit

      if (!isNIP && !isNISN) {
        setError("Format NIP/NISN tidak valid");
        setIsButtonLoading(false);
        return;
      }
    }

    let username;
    if (isAdmin) {
      username = "admin";
    } else if (isKepalaSekolah) {
      username = "kepalasekolah";
    } else if (/^\d{18}$/.test(identifier)) {
      username = `g-${identifier}`;
    } else {
      username = `s-${identifier}`;
    }

    try {
      await signIn.create({
        identifier: username,
        password,
      });
      await waitForUserAndRedirect();
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Login gagal");
    } finally {
      setIsButtonLoading(false);
    }
  };

  // Polling user session and redirect
  const waitForUserAndRedirect = async () => {
    for (let i = 0; i < 20; i++) {
      await new Promise((res) => setTimeout(res, 250));
      // get latest user from useUser
      if (isSignedIn && user?.publicMetadata?.role) {
        router.push(`/${user.publicMetadata.role}`);
        return;
      }
    }
    // Jika gagal, reload saja
    window.location.reload();
  };

  return (
    <div className="bg-img-light h-screen flex flex-col items-center justify-center w-screen p-6 gap-4">
      <form
        onSubmit={handleLogin}
        className="bg-white/70 p-8 rounded-2xl shadow-md xl:w-md md:w-md sm:w-sm  flex-col gap-4  flex"
      >
        <h1 className=" text-gray-700 text-xl font-bold flex items-center gap-2">
          <Image
            src="/LogoSMAN5Medan.png"
            alt="logo"
            width={32}
            height={32}
            unoptimized
          />{" "}
          SMAN 5 Medan
        </h1>
        <hr />
        <h1 className="pt-2 text-md font-medium text-gray-900">
          Selamat Datang!
        </h1>
        {error && <div className="text-sm text-red-400">{error}</div>}
        <div className="flex flex-col gap-2  pb-2">
          <label className="text-sm text-gray-500">NISN/NIP</label>
          <input
            type="text"
            required
            className="text-gray-800 p-2 rounded-md ring-1 ring-gray-300 "
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <label className="text-sm text-gray-500">Kata Sandi</label>
          <input
            type="password"
            required
            className="text-gray-800 p-2 rounded-md ring-1 ring-gray-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="bg-cyan-500  text-white rounded-md text-sm p-[10px] hover:bg-cyan-600 transition-colors w-full"
          disabled={isButtonLoading}
        >
          {isButtonLoading ? (
            /* <LoadingSpinner size="sm" /> */
            <span>Signing in...</span>
          ) : (
            "Sign In"
          )}
        </button>
      </form>
      <div className="bg-white/50 p-8 py-4 rounded-2xl shadow-md xl:w-md md:w-md sm:w-sm  flex-col gap-4  flex text-gray-500">
        <p>Mengalami kendala? Silakan laporkan kepada administrator. </p>
      </div>
    </div>
  );
};

export default LoginPage;
