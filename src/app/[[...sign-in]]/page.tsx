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
  const [showPassword, setShowPassword] = useState(false);
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
            {isAuthenticating ? "Masuk ke akun..." : "Memuat..."}
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
    <div className="bg-img-light h-screen flex flex-col items-center justify-center w-screen p-6 gap-6">
      <div className="flex flex-col gap-4 w-full max-w-md">
      <form
        onSubmit={handleLogin}
        className="backdrop-blur-lg bg-white/30 border border-white/40 p-8 rounded-3xl shadow-2xl xl:w-md md:w-md sm:w-sm flex-col gap-6 flex hover:bg-white/35 transition-all duration-300 ease-in-out"
        style={{
          boxShadow: '0 25px 45px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'
        }}
      >
        {/* Header dengan Logo dan Judul */}
        <div className="flex flex-col items-center justify-center pb-4">
          <div className="flex-shrink-0 mb-3">
            <Image
              src="/LogoSMAN5Medan.png"
              alt="logo"
              width={70}
              height={70}
              unoptimized
            />
          </div>
          <div className="text-center">
            <h1 className="text-gray-800 text-2xl font-bold leading-tight">
              SMAN 5 Medan
            </h1>
          </div>
        </div>
        
        <hr className="border-gray-300/50 -my-2" />
       
        {error && (
          <div className="backdrop-blur-sm bg-red-500/20 border border-red-500/30 text-red-700 p-3 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-slate-700 dark:text-slate-700 tracking-wide">NISN/NIP</label>
          <input
            type="text"
            required
            className="backdrop-blur-sm bg-white/50 border border-gray-400/30 dark:border-gray-400/30 text-gray-800 p-3 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
            placeholder="Masukkan NISN atau NIP"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="text-base font-bold text-slate-700 dark:text-slate-700 tracking-wide">Kata Sandi</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              className="backdrop-blur-sm bg-white/50 border border-gray-400/30 dark:border-gray-400/30 text-gray-800 p-3 pr-12 rounded-xl placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 w-full"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="2" y1="2" x2="22" y2="22" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-cyan-500 hover:bg-cyan-600 cursor-pointer text-white p-3 rounded-xl font-medium disabled:opacity-50 transition-all duration-300"
          disabled={isButtonLoading}
        >
          <span className="relative">
            {isButtonLoading ? "Sedang Masuk..." : "Masuk"}
          </span>
        </button>
      </form>
      
      <div className="backdrop-blur-lg bg-gradient-to-br from-amber-100/40 to-orange-100/40 border border-amber-200/60 p-6 rounded-3xl shadow-xl xl:w-md md:w-md sm:w-sm flex-col gap-3 flex hover:bg-gradient-to-br hover:from-amber-100/50 hover:to-orange-100/50 transition-all duration-300"
        style={{
          boxShadow: '0 20px 35px rgba(245, 158, 11, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.4) inset'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 backdrop-blur-sm border border-amber-300/40">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-amber-800 text-sm">Butuh Bantuan?</h3>
            <p className="text-amber-700 text-sm">Mengalami kendala? Silakan laporkan kepada administrator.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default LoginPage;