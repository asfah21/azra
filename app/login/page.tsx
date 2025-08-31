"use client";

import { signIn, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Card, CardHeader, CardFooter } from "@heroui/react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import { Logo } from "@/components/icons";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  // Cek localStorage untuk auto-fill
  const [email, setEmail] = useState(() => {
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("azra_remember");

      if (remembered) {
        try {
          const creds = JSON.parse(remembered);

          return creds.email || "";
        } catch {}
      }
    }

    return "";
  });
  const [password, setPassword] = useState(() => {
    if (typeof window !== "undefined") {
      const remembered = localStorage.getItem("azra_remember");

      if (remembered) {
        try {
          const creds = JSON.parse(remembered);

          return creds.password || "";
        } catch {}
      }
    }

    return "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockUntil, setLockUntil] = useState<Date | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

      router.push(callbackUrl);
    }
  }, [status, session, router, searchParams]);

  // Check for error in URL (from NextAuth)
  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam === "CredentialsSignin") {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoginAttempts((prev) => prev + 1);
    } else if (errorParam) {
      setError("Terjadi kesalahan saat login. Silakan coba lagi nanti.");
    }
  }, [searchParams]);

  // Check for locked account
  useEffect(() => {
    if (loginAttempts >= 5) {
      const lockTime = new Date();

      lockTime.setMinutes(lockTime.getMinutes() + 15);
      setLockUntil(lockTime);
      setIsLocked(true);

      const timer = setTimeout(
        () => {
          setIsLocked(false);
          setLoginAttempts(0);
          setLockUntil(null);
        },
        15 * 60 * 1000,
      ); // 15 minutes

      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      setError(`Akun terkunci hingga ${lockUntil?.toLocaleTimeString()}`);

      return;
    }

    if (!email || !password) {
      setError("Email dan password harus diisi");

      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        remember: rememberMe.toString(),
        callbackUrl: searchParams.get("callbackUrl") || "/dashboard",
      });

      if (result?.error) {
        setError("Email atau password salah");
        setLoginAttempts((prev) => prev + 1);
      } else {
        // Reset attempts on successful login
        setLoginAttempts(0);
        // Save credentials if rememberMe checked
        if (rememberMe) {
          localStorage.setItem(
            "azra_remember",
            JSON.stringify({ email, password }),
          );
        } else {
          localStorage.removeItem("azra_remember");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Terjadi kesalahan saat login. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const [isVisible, setIsVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const toggleVisibility = () => setIsVisible(!isVisible);
  const toggleRememberMe = () => setRememberMe(!rememberMe);

  const getRemainingLockTime = () => {
    if (!lockUntil) return 0;
    const now = new Date();

    return Math.max(0, lockUntil.getTime() - now.getTime());
  };

  const formatRemainingTime = (ms: number) => {
    const minutes = Math.ceil(ms / (60 * 1000));

    return `${minutes} menit`;
  };

  // Redirect jika sudah login
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  // Tampilkan loading jika sedang mengecek session
  if (status === "loading" || status === "authenticated") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-small text-default-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 dark:from-black dark:to-gray-950 p-4 sm:p-6">
      <Card className="w-full max-w-md shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden border border-opacity-10 border-white dark:border-gray-700 backdrop-blur-sm bg-white/90 dark:bg-gray-900/30">
        <CardHeader className="flex flex-col gap-3 p-3 sm:p-5 pb-2">
          <div className="flex justify-center mb-2">
            {/* <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-full">
              <svg
                className="h-7 w-7 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div> */}
          </div>
          <div className="flex items-center gap-2">
            {/* <div className="w-8 h-8 bg-gradient-to-br from-primary to-success-300 rounded-lg flex items-center justify-center"> */}
            {/* <span className="text-white font-bold text-sm"> */}
            <Logo />
            {/* </span> */}
            {/* </div> */}
            {/* <h1 className="text-xl font-bold text-foreground">
              AZRA <VersiApp />
            </h1> */}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Please enter your credentials to access your account
          </p>

          {/* <div className="flex flex-col text-center">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-success bg-[length:200%_200%] animate-[gradient_4s_ease-in-out_infinite]">
              AZRA <VersiApp />
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Please enter your credentials to access your account
            </p>
          </div> */}
        </CardHeader>

        {/* <Divider className="my-2 sm:my-3 opacity-40" /> */}

        {/* <div className="shadow-xl border border-gray-100 overflow-hidden"> */}
        <div className="bg-gradient-to-r from-green-600 to-blue-800 h-1.5 w-full" />
        <div className="space-y-6 p-6">
          {error && (
            <Alert className="mb-6">
              {error}
              {isLocked && lockUntil && (
                <div className="mt-1 text-xs">
                  Coba lagi dalam {formatRemainingTime(getRemainingLockTime())}
                </div>
              )}
            </Alert>
          )}
          {/* <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Masuk ke Akun
              </h3>
              <p className="text-sm text-gray-500">
                Gunakan email dan kata sandi Anda untuk melanjutkan
              </p>
            </div> */}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="email"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  required
                  autoComplete="email"
                  className="bg-gray-50 dark:bg-gray-900 block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isLocked || loading}
                  id="email"
                  placeholder="email@contoh.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                  htmlFor="password"
                >
                  Password
                </label>
                {/* <a
                  className="text-xs font-medium text-blue-600 hover:text-blue-500"
                  href="#"
                >
                  Forgot password?
                </a> */}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      clipRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <input
                  required
                  autoComplete="current-password"
                  className="bg-gray-50 dark:bg-gray-900 block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={isLocked || loading}
                  id="password"
                  placeholder="••••••••"
                  type={isVisible ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none disabled:opacity-50"
                  disabled={isLocked || loading}
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                checked={rememberMe}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                id="remember-me"
                name="remember-me"
                type="checkbox"
                onChange={toggleRememberMe}
              />
              <label
                className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="remember-me"
              >
                &nbsp;Remember this device
              </label>
            </div>

            <div className="pt-2">
              <button
                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLocked ? "opacity-50 cursor-not-allowed" : ""} ${loading ? "opacity-70" : ""}`}
                disabled={isLocked || loading}
                type="submit"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        fill="currentColor"
                      />
                    </svg>
                    processing...
                  </>
                ) : (
                  "Login"
                )}
              </button>
            </div>
          </form>
        </div>

        <CardFooter className="mt-2 flex justify-center py-3 sm:py-6 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl sm:rounded-b-2xl">
          <p className="text-xs text-center text-gray-500">
            {new Date().getFullYear()} © Copyright by PT Gunung Samudera
            Internasional
          </p>
        </CardFooter>

        {/* <div className="text-center mt-4">
          <VersiApp className="text-xs text-gray-400" />
        </div> */}
      </Card>
    </div>
  );
}
